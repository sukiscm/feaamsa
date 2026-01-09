// src/app/(DashboardLayout)/layout/sidebar/MenuItems.tsx
import {
  IconAperture,
  IconCopy,
  IconLayoutDashboard,
  IconLogin,
  IconMoodHappy,
  IconTypography,
  IconUserPlus,
  IconTicket,
  IconBox,
  IconMapPin,
  IconPackage,
  IconClipboardList,
  IconTemplate,      // 👈 NUEVO
  IconChartBar,      // 👈 NUEVO
} from "@tabler/icons-react";

import { uniqueId } from "lodash";

const Menuitems = [
  {
    navlabel: true,
    subheader: "Inicio",
  },
  {
    id: uniqueId(),
    title: "Dashboard",
    icon: IconLayoutDashboard,
    href: "/",
  },
  {
    navlabel: true,
    subheader: "Operaciones",
  },
  {
    id: uniqueId(),
    title: "Tickets",
    icon: IconTicket,
    href: "/tickets",
  },
  {
    id: uniqueId(),
    title: "Requisiciones",
    icon: IconClipboardList,
    href: "/material-requests",
  },
  {
    navlabel: true,
    subheader: "Inventario",
  },
  {
    id: uniqueId(),
    title: "Items",
    icon: IconBox,
    href: "/inventario",
  },
  {
    id: uniqueId(),
    title: "Ubicaciones",
    icon: IconMapPin,
    href: "/catalog/locations",
  },
  {
    id: uniqueId(),
    title: "Movimientos",
    icon: IconPackage,
    href: "/inventory/movements",
  },
  {
  id: 'stock-location',
  title: 'Stock por Ubicación',
  icon: IconPackage,
  href: '/inventario/stock-location',  // 👈 Con "inventario" en español
},
  {
    navlabel: true,
    subheader: "Administración",  // 👈 NUEVA SECCIÓN
  },
  {
    id: uniqueId(),
    title: "Plantillas",           // 👈 NUEVO
    icon: IconTemplate,
    href: "/admin/presets",
  },
  {
    id: uniqueId(),
    title: "Estadísticas",         // 👈 NUEVO
    icon: IconChartBar,
    href: "/admin/presets/stats",
  },
];

export default Menuitems;