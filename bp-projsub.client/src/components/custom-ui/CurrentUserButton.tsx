import { useAuth } from "@/context/UserContext";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { LogOut, Settings, User } from "lucide-react";

export default function CurrentUserButton() {
  const { user, logout } = useAuth();

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className=" gap-2 hover:bg-accent hover:text-accent-foreground"
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
                <span className="font-medium truncate max-w-[120px]">
                  {user?.username}
                </span>
                <span className="text-xs text-muted-foreground">
                  ({user?.roles?.join(', ')})
                </span>
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="center" className="w-auto">
          <DropdownMenuItem asChild>
            <Link to="/account" className="cursor-pointer w-full flex items-center gap-2 p-2">
              <Settings className="mr-2"/>
              Account Settings
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem
            onSelect={logout}
            className="cursor-pointer text-destructive focus:bg-destructive/10 flex items-center gap-2 p-2"
          >
            <LogOut className="mr-2"/>
            Logout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  };
