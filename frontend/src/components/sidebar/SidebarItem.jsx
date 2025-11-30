import { NavLink } from "react-router";
import { cn } from "../../utils/cn";



const SidebarItem = ({
  item,
  className,
  ...props
}) => {
  return (
    <NavLink
      className={({ isActive }) =>
        cn(
          "text-md relative flex items-center gap-4 transition-all",
          className,
        )
      }
      to={item.path}
      {...props}
    >
      <item.icon size={20} />
      <span className={cn("max-lg:hidden")}>{item.name}</span>
      {item.hasCount && (
        <div
          className={cn(
            "center-content bg-accent text-accent-content absolute right-3 rounded-full text-xs lg:px-2 lg:py-1",
            "-top-0 transition-all max-lg:p-1 max-lg:text-[10px] sm:right-1 lg:top-auto lg:right-2",
          )}
        >
          {item.count ?? 12}
        </div>
      )}
    </NavLink>
  );
};

export default SidebarItem;
