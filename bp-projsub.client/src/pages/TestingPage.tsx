import { Link } from "react-router-dom";

export function TestingPage() {

  return (
    <>
      <div className="flex flex-col justify-center items-center mt-4">
        This is testing page
        <Link className="text-red-600" to="/account/changepassword">Change Password</Link>
      </div>
    </>
  );
}
