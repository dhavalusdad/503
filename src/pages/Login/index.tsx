import { LeftContent, RightContent } from "@/features/login";

const Login = () => {
  return (
    <div className="h-screen flex">
      <div className="w-2/4">
        <LeftContent />
      </div>
      <div className="w-2/4 bg-white flex items-center justify-center m-auto">
        <RightContent />
      </div>
    </div>
  );
};

export default Login;
