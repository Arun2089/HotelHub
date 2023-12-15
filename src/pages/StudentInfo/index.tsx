import { useState, ChangeEvent, MouseEvent, useEffect } from "react";
import {
  IconButton,
  Box,
  Typography,
  DialogContent,
  Button,
} from "@mui/material";
import {
  GridColDef,
  GridColumnHeaderParams,
  GridAlignment,
} from "@mui/x-data-grid";
import { EditOutlined, DeleteOutlineOutlined, Add } from "@mui/icons-material";

import TableComponent from "@components/Table";
import AlertComponent from "@components/Alert";
import ConfirmationModal from "@components/ConfirmationModal";
import SearchBar from "@components/SearchBar";
import StudentProfile from "./StudentProfile";
import AddStudent from "./addStudent";

import useDialog from "@src/hooks/useDialog";
import useAlert from "@src/hooks/useAlert";
import { sendData, deleteData, catchErrorMessage } from "@utils/index";
import { checkEmailExists } from "@utils/index";
import { STUDENT_INFO_URL } from "@src/constant";
import {
  StudentInfoType,
  StudentInfoStateType,
  SeverityType,
  AddStudentStateType,
} from "@ts/types";

const handleDelete = async (
  studentInfo: StudentInfoType,
  handleAlert: (
    isOpen: boolean,
    message: string,
    serverity: SeverityType
  ) => void
) => {
  const { id } = studentInfo;
  try {
    if (!id) {
      throw new Error("Student do not exist");
    }
    const isDataDeleted = await deleteData(`${STUDENT_INFO_URL}/${id}`);
    const message = isDataDeleted
      ? "Student data deleted"
      : "Error, data not deleted";
    const severity = isDataDeleted ? "success" : "error";
    handleAlert(true, message, severity);
  } catch (error) {
    handleAlert(true, catchErrorMessage(error), "error");
  }
};

const saveStudentData = async (
  studentInfo: StudentInfoType,
  handleAlert: (
    isOpen: boolean,
    message: string,
    serverity: SeverityType
  ) => void
) => {
  const { id } = studentInfo;
  const url = `${STUDENT_INFO_URL}/${id}`;
  try {
    const isDataUpdated = await sendData(url, "PUT", studentInfo);
    const message = isDataUpdated
      ? "Data updated successfully"
      : "Data not updated";
    const severity = isDataUpdated ? "success" : "error";
    handleAlert(true, message, severity);
  } catch (error) {
    handleAlert(true, catchErrorMessage(error), "error");
  }
};

const addStudentData = async (
  { confirmPassword, ...studentData }: AddStudentStateType, //eslint-disable-line
  handleAlert: (
    isOpen: boolean,
    message: string,
    serverity: SeverityType
  ) => void
) => {
  try {
    const isDataSent = await sendData(STUDENT_INFO_URL, "POST", studentData);
    const message = isDataSent ? "Data saved successfully" : "Data not saved";
    const severity = isDataSent ? "success" : "error";
    handleAlert(true, message, severity);
  } catch (error) {
    handleAlert(true, catchErrorMessage(error), "error");
  }
};

const commonOptions: {
  sortable: boolean;
  align: GridAlignment;
  headerAlign: GridAlignment;
  renderHeader: (params: GridColumnHeaderParams) => JSX.Element;
} = {
  sortable: false,
  align: "center",
  headerAlign: "center",
  renderHeader({ colDef: { headerName } }: GridColumnHeaderParams) {
    return <Typography className="font-semibold">{headerName}</Typography>;
  },
};

const StudentInfo = () => {
  const [studentsData, setStudentsData] = useState<StudentInfoType[] | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [rowCount, setRowCount] = useState<number>(100);
  const [seletedStudent, setSelectedStudent] =
    useState<StudentInfoStateType | null>(null);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 10,
  });
  const { alert, handleAlert } = useAlert();
  const { isOpen, message, severity } = alert;
  const { open, handleDialogClick, handleDialogSubmit } = useDialog(
    async () => {
      await handleDelete(seletedStudent!.studentInfo, handleAlert);
      getStudentInfoData(true, paginationModel.page);
    }
  );
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] =
    useState<boolean>(false);
  const [searchText, setSearchText] = useState<string>("");

  useEffect(() => {
    const getData = setTimeout(() => {
      setPaginationModel({ ...paginationModel, page: 0 });
      getStudentInfoData(true, 0, searchText);
    }, 300);
    return () => clearTimeout(getData);
  }, [searchText]);

  const handleSeachTextChange = ({
    target: { value },
  }: ChangeEvent<HTMLInputElement>) => {
    setSearchText(value);
  };

  const handleAddStudentModal = (state: boolean) =>
    setIsAddStudentModalOpen(state);

  const columns: GridColDef[] = [
    {
      field: "id",
      headerName: "Id",
      minWidth: 150,
      headerClassName: "pl-8",
      cellClassName: "pl-8 hover:cursor-pointer",
      ...commonOptions,
    },
    {
      field: "roomNumber",
      headerName: "Room number",
      minWidth: 150,
      cellClassName: "hover:cursor-pointer",
      ...commonOptions,
      renderCell: ({ row: { roomNumber } }) => {
        const room = roomNumber ? roomNumber : "---";
        return (
          <Box>
            <Typography>{room}</Typography>
          </Box>
        );
      },
    },
    {
      field: "studentName",
      headerName: "Name",
      minWidth: 170,
      flex: 1,
      cellClassName: "hover:cursor-pointer",
      ...commonOptions,
    },
    {
      field: "mobileNumber",
      headerName: "Mobile Number",
      minWidth: 170,
      flex: 1,
      cellClassName: "hover:cursor-pointer",
      ...commonOptions,
    },
    {
      field: "guardianName",
      headerName: "Guardian Name",
      minWidth: 170,
      flex: 1,
      cellClassName: "hover:cursor-pointer",
      ...commonOptions,
    },
    {
      field: "Actions",
      headerName: "Actions",
      minWidth: 170,
      cellClassName: "hover:cursor-pointer",
      ...commonOptions,
      renderCell: ({ row }) => {
        return (
          <Box>
            <IconButton
              size="large"
              className="p-2 text-primary-main"
              onClick={(event) => {
                handleModalOpen(event, row as StudentInfoType, true);
              }}
            >
              <EditOutlined />
            </IconButton>
            <IconButton
              onClick={(event) => {
                event.stopPropagation();
                setSelectedStudent({
                  studentInfo: row as StudentInfoType,
                  isEditable: false,
                  isStudentInfoModalOpen: false,
                });
                handleDialogClick(true);
              }}
              size="large"
              className="p-2 text-error-main"
            >
              <DeleteOutlineOutlined />
            </IconButton>
          </Box>
        );
      },
    },
  ];

  async function getStudentInfoData(
    pagination: boolean,
    page?: number,
    searchText?: string
  ) {
    try {
      setLoading(true);
      const response = await fetch(`${STUDENT_INFO_URL}`);
      const data = await response.json();

      const filteredData = searchText
        ? data.filter((student: StudentInfoType) =>
            student.studentName.toLowerCase().includes(searchText.toLowerCase())
          )
        : data;
      if (!pagination) setStudentsData(filteredData);
      else {
        setStudentsData(filteredData.slice(page! * 10, page! * 10 + 10));
      }
      setRowCount(filteredData.length);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      handleAlert(true, "An error occurred", "error");
    }
  }
  const handleModalOpen = (
    event: MouseEvent<Element>,
    studentInfo: StudentInfoType,
    isEditable: boolean
  ) => {
    event.stopPropagation();
    setSelectedStudent({
      studentInfo,
      isEditable,
      isStudentInfoModalOpen: true,
    });
  };

  const handleModalClose = () => setSelectedStudent(null);

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    const { name, value }: { name: string; value: string } = event.target;
    setSelectedStudent({
      ...seletedStudent!,
      studentInfo: {
        ...seletedStudent!.studentInfo,
        [name]: value,
      },
    });
  };

  const handleAddNewStudent = async (studentInfo: AddStudentStateType) => {
    await addStudentData(studentInfo, handleAlert);
    handleAddStudentModal(false);
    getStudentInfoData(true, paginationModel.page);
  };

  const handleSubmit = async (studentInfo: StudentInfoType) => {
    const { email, id } = studentInfo;
    if (await checkEmailExists(email, id)) {
      handleAlert(true, "Email already exists", "error");
      return;
    }
    await saveStudentData(studentInfo, handleAlert);
    handleModalClose();
    setSelectedStudent(null);
    getStudentInfoData(true, paginationModel.page);
  };

  return (
    <>
      <Box className="flex w-[96%] shrink flex-wrap mx-auto justify-between gap-y-3 ">
        <SearchBar
          value={searchText}
          onChange={handleSeachTextChange}
          className="px-[2px] py-[4px] flex w-full md:w-[40%] lg:w-1/4 rounded-3xl bg-primary-main bg-opacity-10 focus-within:ring-2 focus-within:ring-primary-main"
        />
        <Button
          size="large"
          className="w-[6rem]"
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleAddStudentModal(true)}
        >
          Add
        </Button>
      </Box>
      <Box className="w-[96%] h-[85vh] md:h-full my-4 xl:my-6 mx-auto overflow-hidden rounded-xl">
        <TableComponent
          columns={columns}
          isLoading={loading}
          rows={studentsData || []}
          tableClassName="max-h-full bg-white rounded-xl"
          pagination={true}
          getData={getStudentInfoData}
          rowCount={rowCount}
          paginationModel={paginationModel}
          setPaginationModel={setPaginationModel}
          onRowClick={(event, row) =>
            handleModalOpen(event, row as StudentInfoType, false)
          }
          searchText={searchText}
        />
        <ConfirmationModal
          isOpen={open}
          handleClose={() => handleDialogClick(false)}
          handleSubmit={handleDialogSubmit}
          title="Are You Sure ?"
          buttontext="delete"
          buttonType="delete"
        >
          <DialogContent className="padding-0">
            Student Data will be deleted
          </DialogContent>
        </ConfirmationModal>

        {isOpen && (
          <AlertComponent
            severity={severity}
            message={message}
            handleClose={() => handleAlert(false)}
          />
        )}
        {isAddStudentModalOpen && (
          <AddStudent
            handleClose={() => {
              handleAddStudentModal(false);
            }}
            handleSubmit={handleAddNewStudent}
          />
        )}
        {seletedStudent && (
          <StudentProfile
            open={seletedStudent.isStudentInfoModalOpen}
            seletetedStudentState={seletedStudent!}
            handleClose={handleModalClose}
            handleSubmit={handleSubmit}
            handleChange={handleChange}
          />
        )}
      </Box>
    </>
  );
};

export default StudentInfo;