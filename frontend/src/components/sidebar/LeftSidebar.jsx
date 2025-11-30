import { FaBell, FaHouseChimney, FaUsers } from "react-icons/fa6";
import { MdAssignmentAdd } from "react-icons/md";
import { IoChatbox, IoNewspaperSharp } from "react-icons/io5";
import { cn } from "../../utils/cn";
import SidebarItem from "./SidebarItem";

const LeftSidebar = ({ className }) => {
  const sidebarItems = [
    {
      name: "Home",
      path: "/home",
      icon: FaHouseChimney,
      hasCount: false,
      forSm: true,
    },
    {
      name: "Requests",
      path: "requests",
      icon: MdAssignmentAdd,
      hasCount: true,
      forSm: true,
    },
    {
      name: "Workspace",
      path: "workspace",
      icon: IoChatbox,
      hasCount: true,
      forSm: false,
    },
    {
      name: "Messages",
      path: "messages",
      icon: FaBell,
      hasCount: true,
      forSm: false,
    },
    {
      name: "My Profile",
      path: "my-profile",
      icon: IoNewspaperSharp,
      hasCount: false,
      forSm: true,
    },
  ];
  return (
    <div
      className={cn(
        "border-popover z-8 flex flex-col justify-between transition-all sm:py-5",
        className,
      )}
    >
      <div className="flex w-full flex-col gap-4">
        <div className="flex justify-between sm:flex-col">
          {sidebarItems.map((item) => (
            <SidebarItem
              key={item.name}
              item={item}
              className={cn(
                "flex-1 px-3 py-3 max-lg:justify-center sm:w-full",
                !item.forSm && "max-sm:hidden",
              )}
            />
          ))}
        </div>
        <div className="mx-3 flex flex-col gap-3 transition-all max-lg:hidden">
          <h5>My Tags</h5>
          
        </div>
      </div>
      <div className="-muted/60 mx-3 text-xs max-lg:hidden">
        <p>© {new Date().getFullYear()} Research Nest</p>
        <p>All rights reserved.</p>
        <p>Privacy Policy | Terms of Service</p>
      </div>
    </div>
  );
};


export default LeftSidebar;
