"use client";

import useSeller from "@/hooks/useSeller";
import useSidebar from "@/hooks/useSidebar";
import { redirect, usePathname } from "next/navigation";
import React, { useEffect } from "react";
import Box from "../box";
import { Sidebar } from "./sidebar.styles";
import Link from "next/link";
import Logo from "@/assets/svgs/logo";
import SidebarItem from "./sidebar.item";
import Home from "@/assets/icons/home";
import SidebarMenu from "./sidebar.menu";
import {
  FaList,
  FaPlusSquare,
  FaBoxes,
  FaCalendarPlus,
  FaBell,
  FaEnvelope,
  FaCog,
  FaBell as FaBellRing,
  FaTicketAlt,
  FaSignOutAlt,
} from "react-icons/fa";
import Payment from "@/assets/icons/payment";
import useRequireAuth from "@/hooks/useRequiredAuth";

const SidebarBarWrapper = () => {
  const { activeSidebar, setActiveSidebar } = useSidebar();
  const pathName = usePathname();
  const { seller } = useRequireAuth();

  useEffect(() => {
    setActiveSidebar(pathName);
  }, [pathName, setActiveSidebar]);

  const getIconColor = (route: string) =>
    activeSidebar === route ? "#0085ff" : "#969696";

  return (
    <Box
      css={{
        height: "100vh",
        zIndex: 202,
        position: "sticky",
        padding: "8px",
        top: "0",
        overflowY: "scroll",
        scrollbarWidth: "none",
      }}
      className="sidebar-wrapper"
    >
      <Sidebar.Header>
        <Box>
          <Link href={"/"} className="flex justify-center text-center gap-2">
            <Logo />
            <Box>
              <h3 className="text-xl font-medium text-[#ecedee]">
                {seller?.shop?.name}
              </h3>
              <h5 className="font-medium pl-2 text-xs text-[#ecedeecf] whitespace-nowrap overflow-hidden text-ellipsis max-w-[170px]">
                {seller?.shop?.address}
              </h5>
            </Box>
          </Link>
        </Box>
      </Sidebar.Header>
      <div className="block my-3 h-full">
        <Sidebar.Body className="body sidebar">
          <SidebarItem
            title="Dashboard"
            icon={<Home fill={getIconColor("/dashboard")} />}
            isActive={activeSidebar === "/dashboard"}
            href="/dashboard"
          />
          <div className="mt-2 block">
            <SidebarMenu title="Main Menu">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/orders"}
                title="Orders"
                href="/dashboard/orders"
                icon={
                  <FaList
                    size={26}
                    color={getIconColor("/dashboard/orders")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/payments"}
                title="Payments"
                href="/dashboard/payments"
                icon={<Payment fill={getIconColor("/dashboard/payments")} />}
              />
            </SidebarMenu>
            <SidebarMenu title="Products">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/create-product"}
                title="Create Product"
                href="/dashboard/create-product"
                icon={
                  <FaPlusSquare
                    size={24}
                    color={getIconColor("/dashboard/create-product")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/all-products"}
                title="All Products"
                href="/dashboard/all-products"
                icon={
                  <FaBoxes
                    size={22}
                    color={getIconColor("/dashboard/all-products")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Events">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/create-event"}
                title="Create Event"
                href="/dashboard/create-event"
                icon={
                  <FaCalendarPlus
                    size={24}
                    color={getIconColor("/dashboard/create-event")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/all-events"}
                title="All Events"
                href="/dashboard/all-events"
                icon={
                  <FaBell
                    size={24}
                    color={getIconColor("/dashboard/all-events")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Controllers">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/inbox"}
                title="Inbox"
                href="/dashboard/inbox"
                icon={
                  <FaEnvelope size={20} color={getIconColor("/dashboard/inbox")} />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/settings"}
                title="Settings"
                href="/dashboard/settings"
                icon={
                  <FaCog
                    size={22}
                    color={getIconColor("/dashboard/settings")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/dashboard/notifications"}
                title="Notifications"
                href="/dashboard/notifications"
                icon={
                  <FaBellRing
                    size={24}
                    color={getIconColor("/dashboard/notifications")}
                  />
                }
              />
            </SidebarMenu>
            <SidebarMenu title="Extras">
              <SidebarItem
                isActive={activeSidebar === "/dashboard/discount-codes"}
                title="Discount Codes"
                href="/dashboard/discount-codes"
                icon={
                  <FaTicketAlt
                    size={22}
                    color={getIconColor("/dashboard/discount-codes")}
                  />
                }
              />
              <SidebarItem
                isActive={activeSidebar === "/logout"}
                title="Logout"
                href="/"
                icon={<FaSignOutAlt size={20} color={getIconColor("/logout")} />}
              />
            </SidebarMenu>
          </div>
        </Sidebar.Body>
      </div>
    </Box>
  );
};

export default SidebarBarWrapper;