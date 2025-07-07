import { ROUTES } from "@/constants/routePath";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Root = () => {
  const navigate = useNavigate();
  useEffect(() => {
    navigate(ROUTES.DASHBOARD.path);
    console.log("Root");
  }, []);
  return (
    <div>
      Root
    </div>
  );
};

export default Root;