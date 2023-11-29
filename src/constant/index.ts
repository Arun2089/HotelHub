import {
  Dashboard as DashboardIcon,
  AccountBox as AccountBoxIcon,
  Assessment as AssessmentIcon,
  RestaurantMenu as RestaurantMenuIcon,
  BedroomParent as BedroomParentIcon,
  AssignmentIndRounded as AssignmentIndRoundedIcon,
} from "@mui/icons-material";

import { SidebarValueType, AdminDashboardDetailsTypes } from "@ts/types";

export const ADMIN_SIDEBAR: SidebarValueType[] = [
  {
    field: "Dashboard",
    icon: DashboardIcon,
    path: "dashboard",
  },
  {
    field: "Student Info.",
    icon: AccountBoxIcon,
    path: "students",
  },
  {
    field: "Complaints",
    icon: AssessmentIcon,
    path: "complaints",
  },
  {
    field: "Canteen Menu",
    icon: RestaurantMenuIcon,
    path: "canteenMenu",
  },
  {
    field: "Rooms",
    icon: BedroomParentIcon,
    path: "rooms",
  },
];

export const STUDENT_SIDEBAR: SidebarValueType[] = [
  {
    field: "Dashboard",
    icon: DashboardIcon,
    path: "dashboard",
  },
  {
    field: "Complaints",
    icon: AssessmentIcon,
    path: "complaints",
  },
  {
    field: "Canteen Menu",
    icon: RestaurantMenuIcon,
    path: "conteenMenu",
  },
];

export const SETTINGS: string[] = ["Profile", "Logout"];

export const DASHBOARD_ENDPOINT: string = "dashboard";

export const USER_DATA_URL: string =
  "https://api.npoint.io/de4471c76c2129b205d7";

export const ADMIN_DASHBOARD_DETAIL_URL: string =
  "https://api.npoint.io/afae6426adf49484df48";

export const NOTICES_URL: string = "http://localhost:3001/notice";

export const ROOM_STATUS_DATA_URL: string =
  "https://api.npoint.io/89bedc5ce0a4a2482847";

export const STAFF_LIST_URL = "https://api.npoint.io/a3ada2b77246b3d38e20";

export const COMPLAINTS_STATS_URL =
  "https://api.npoint.io/34d932b8609356c8bd40";

export const STUDENT_INFO_URL = "http://localhost:3001/studentInfo";

export const ADMIN_DASHBOARD_DETAIL: AdminDashboardDetailsTypes[] = [
  {
    label: "Students",
    icon: AccountBoxIcon,
    field: "numberOfStudents",
    color: "bg-primary-main",
    path: "students",
  },
  {
    label: "Complaints",
    icon: AssessmentIcon,
    field: "complaitsPending",
    color: "bg-common-lightBlue",
    path: "complaints",
  },

  {
    label: "Rooms",
    icon: BedroomParentIcon,
    field: "numberOfRooms",
    color: "bg-success-light",
    path: "rooms",
  },
  {
    label: "Staff",
    icon: AssignmentIndRoundedIcon,
    field: "numberOfStaff",
    color: "bg-secondary-main",
    path: "",
  },
];
