
interface ErrorProps {
  path?: string;
}

export const Error: React.FC<ErrorProps> = () => {
  return (
    // <div className="h-screen flex items-center justify-center">
    //   <div className="flex flex-col items-center gap-30px">
    //     <Icon name="errorSvg" />
    //     <div className="flex flex-col items-center gap-3 -mt-10">
    //       <h3 className="text-30px font-medium leading-9 text-black">
    //         Something went wrong.
    //       </h3>
    //       {path && (
    //         <p className="text-xl font-normal leading-6 text-black">
    //           Please return to dashboard or try again later
    //         </p>
    //       )}
    //     </div>
    //     {path && (
    //       <div className="inline-block mx-auto">
    //         <Button
    //           variant="filled"
    //           title="Back To Dashboard"
    //           className="px-6 py-3 rounded-lg"
    //           onClick={() => navigate(path)}
    //         />
    //       </div>
    //     )}
    //   </div>
    // </div>

    <div className="flex flex-col items-center gap-30px">
      Something Went Wrong
    </div>
  );
};

export default Error;
