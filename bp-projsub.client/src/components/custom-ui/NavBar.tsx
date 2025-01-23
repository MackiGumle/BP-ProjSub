import { useAuth, UserProfile } from "@/context/UserContext";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export default function NavBar() {
  const { isLoggedIn, user, logout } = useAuth();

  return (
    <div className="bg-zinc-800 text-white p-4 mb-4 w-full">
      <div className="flex justify-between items-center">
        <div className="flex gap-4">
          <Link to="/">Navbar</Link>
          <Link to="/home">Home</Link>
        </div>
        
        <div className="flex items-center gap-4">
          {isLoggedIn() ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-medium">{user?.username}</span>
                <span className="text-sm text-gray-400">
                  ({user?.roles?.join(', ')})
                </span>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-white hover:bg-zinc-700"
                  >
                    ⚙️
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      Account Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={logout}
                    className="cursor-pointer text-red-500 focus:bg-red-50"
                  >
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-4">
              <Link to="/login" className="hover:text-gray-300">
                Login
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}