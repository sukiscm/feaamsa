import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconFileBarcode,
  IconTypography,
  IconUserPlus,
  IconBuildingWarehouse,
  IconPackage,
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "HOME",
  },

  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "Tickets",
  },
  {
    id: uniqueId(),
    title: "Ver Tickets",
    icon: IconFileBarcode,
    href: "/tickets",
  },
  // {
  //   id: uniqueId(),
  //   title: "Shadow",
  //   icon: IconCopy,
  //   href: "/utilities/shadow",
  // },
  {
    navlabel: true,
    subheader: "Inventario (Demo)",
  },
  {
    id: uniqueId(),
    title: "Inventario",
    icon: IconBuildingWarehouse,
    href: "/inventario",
  },
  {
    id: uniqueId(),
    title: "Register",
    icon: IconUserPlus,
    href: "/authentication/register",
  },
  {
  id: uniqueId(),
  title: "Solicitudes de Material",
  icon: IconPackage, // Importar: import { IconPackage } from "@tabler/icons-react";
  href: "/material-requests",
},
  // {
  //   navlabel: true,
  //   subheader: "Tab3",
  // },
  // // {
  // //   id: uniqueId(),
  // //   title: "Icons",
  // //   icon: IconMoodHappy,
  // //   href: "/icons",
  // // },
  // {
  //   id: uniqueId(),
  //   title: "Sample Page",
  //   icon: IconAperture,
  //   href: "/sample-page",
  // },
  // {
  //   id: uniqueId(),
  //   title: "Sample Tamble",
  //   icon: IconAperture,
  //   href: "/sample-table",
  // },
];

export default Menuitems;


