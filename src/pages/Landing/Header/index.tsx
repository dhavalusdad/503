import Icon from "@/components/common/Icon";

const Header = () => {
  return (
    <div className="bg-white border border-solid border-surface py-30px px-38px rounded-20px">
      <div className="flex items-center justify-between">
        <div className="relative">
          <Icon name="logo" />
        </div>
        <div className="flex items-center gap-10">
          <p className="cursor-pointer text-lg font-medium text-blackdark hover:underline underline-offset-2">
            Existing Patient Login
          </p>
          <div className="flex items-center gap-5">
            <button
              type="button"
              className="flex items-center gap-2.5 px-6 py-3.5 border border-solid border-blackdark rounded-10px cursor-pointer"
            >
              <Icon name="phone" className="text-blackdark" />
              <span>1-866-478-3978</span>
            </button>
            <button
              type="button"
              className="flex items-center gap-2.5 px-6 py-3.5 border border-solid border-primary rounded-10px cursor-pointer bg-primary text-white"
            >
              <span>Create Account</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
