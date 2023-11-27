import { ChangeEvent, Fragment, MouseEvent, useState } from "react";
import {
  Paper,
  Typography,
  Divider,
  List,
  Box,
  Button,
  Skeleton,
  DialogContent,
} from "@mui/material";

import { Add as AddIcon } from "@mui/icons-material";

import UseDialog from "@src/hooks/UseDialog";

import NoticeListItem from "./NoticeListItem";
import NoticeModal from "./NoticeModal";
import ActionAlerts from "@components/Alert";

import { NoticeDataType, NoticeStateProps } from "@ts/types";
import ConfirmationModal from "@src/components/ConfirmationModal";
import { NOTICES_URL } from "@constant/index";

type SetAlert = React.Dispatch<
  React.SetStateAction<{
    open: boolean;
    message: string;
  }>
>;

const saveNotice = async (notice: NoticeDataType, setAlert: SetAlert) => {
  try {
    const meathod = notice.id ? "PUT" : "POST";
    const url = notice.id ? `${NOTICES_URL}/${notice.id}` : NOTICES_URL;
    const putData = await fetch(url, {
      method: meathod,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(notice),
    });
    if (putData.ok) {
      console.log("done");
    } else {
      throw new Error("Not updated");
    }
  } catch (error) {
    if (error instanceof Error) {
      setAlert({ open: true, message: error.message });
    } else {
      setAlert({ open: true, message: "An error occurred" });
    }
  }
};

const deleteNotice = async (id: number | null, setAlert: SetAlert) => {
  try {
    if (!id) {
      throw new Error("notice do not exist");
    }
    const deleteResponse = await fetch(`${NOTICES_URL}/${id}`, {
      method: "DELETE",
    });
    if (!deleteResponse.ok) {
      throw new Error(`Server error: ${deleteResponse.statusText}`);
    }
  } catch (error) {
    if (error instanceof Error) {
      setAlert({ open: true, message: error.message });
    } else {
      setAlert({ open: true, message: "An error occurred" });
    }
  }
};

type NoticesProps = {
  notices: NoticeDataType[] | null;
  setupdateNoticeCheck: React.Dispatch<React.SetStateAction<boolean>>;
};

const intitalNoticeState: NoticeDataType = {
  title: "",
  date: new Date().toLocaleDateString(),
  content: "",
};
const NoticeList = ({ notices, setupdateNoticeCheck }: NoticesProps) => {
  const [selectedNotice, setSelectedNotice] = useState<NoticeStateProps>({
    notice: intitalNoticeState,
    isNoticeModalOpen: false,
    isEditable: false,
    addNewNotice: false,
  });
  const [alert, setAlert] = useState({ open: false, message: "" });
  const [deleteNoticeId, setDeleteNoticeId] = useState<number | null>(null);

  const handleDialog = () => {
    deleteNotice(deleteNoticeId, setAlert);
    setupdateNoticeCheck((val) => {
      return !val;
    });
  };

  const { open, handleDialogOpen, handleDialogClose, handleDialogSubmit } =
    UseDialog(handleDialog);

  const handleAlertClose = () => setAlert({ open: false, message: "" });

  const handleOpenNotice = (
    event: MouseEvent<Element>,
    state: string,
    noticeData: NoticeDataType
  ) => {
    event.stopPropagation();
    const isEditable = state === "edit";
    const addNewNotice = state === "addNewNotice";
    setSelectedNotice({
      notice: noticeData,
      isEditable,
      addNewNotice,
      isNoticeModalOpen: true,
    });
  };

  const handleClose = (): void => {
    setSelectedNotice({
      notice: intitalNoticeState,
      isNoticeModalOpen: false,
      isEditable: false,
      addNewNotice: false,
    });
  };

  const handleSubmit = (notice: NoticeDataType): void => {
    saveNotice(notice, setAlert);
    handleClose();
    setupdateNoticeCheck((val) => {
      return !val;
    });
  };

  const handleChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    const { name, value }: { name: string; value: string } = event.target;
    setSelectedNotice({
      ...selectedNotice,
      notice: {
        ...selectedNotice.notice,
        [name]: value,
      },
    });
  };

  return (
    <>
      <Paper className="w-full pb-8 md:w-[48%] lg:w-1/2 px-0 h-1/2 md:h-full flex-grow overflow-hidden rounded-xl">
        <Box className="mx-8 my-4 mb-2.5 flex justify-between">
          <Typography className="text-2xl font-medium">Notice</Typography>
          <Button
            className="hover:bg-primary-dark"
            variant="contained"
            endIcon={<AddIcon />}
            onClick={(event) =>
              handleOpenNotice(event, "addNewNotice", intitalNoticeState)
            }
          >
            Add
          </Button>
        </Box>
        {notices ? (
          <List className="w-full h-[90%] p-0 overflow-y-scroll">
            {notices.reverse().map((notice: NoticeDataType, index: number) => {
              return (
                <Fragment key={notice.id}>
                  <NoticeListItem
                    noticeNumber={index}
                    noticeData={notice}
                    handleOpenNotice={handleOpenNotice}
                    handleOpenConfirmationDialog={handleDialogOpen}
                    setDeleteNoticeId={setDeleteNoticeId}
                  />
                  {index < notices.length - 1 && <Divider className="mx-8" />}
                </Fragment>
              );
            })}
          </List>
        ) : (
          <>
            {[1, 2, 3].map((index: number) => {
              return (
                <Box key={index.toString()} className="mx-8 h-1/3 pt-4">
                  <Skeleton width="30%" />
                  <Skeleton width="10%" />
                  <Skeleton width="100%" height="80%" />
                </Box>
              );
            })}
          </>
        )}
      </Paper>
      <NoticeModal
        selectedNotice={selectedNotice!}
        handleClose={handleClose}
        handleSubmit={handleSubmit}
        handleChange={handleChange}
      />
      <ConfirmationModal
        isOpen={open}
        handleClose={handleDialogClose}
        handleSubmit={handleDialogSubmit}
        title="Are You Sure ?"
        buttontext="delete"
        buttonType="delete"
      >
        <DialogContent className="padding-0">
          This notice will be deleted
        </DialogContent>
      </ConfirmationModal>
      {alert.open && (
        <ActionAlerts
          severity="error"
          message={alert.message}
          handleClose={handleAlertClose}
        />
      )}
    </>
  );
};

export default NoticeList;
