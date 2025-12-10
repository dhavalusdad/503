export const License: React.FC = () => {
  return <>Licenses</>;
  // const [isModalOpen, setIsModalOpen] = useState<string>("");
  // const [isFileUploadModalOpen, setIsFileUploadModalOpen] = useState(false);

  // return (
  //   <div className="bg-white w-full rounded-xl p-4">
  //     <div className="flex justify-between items-center mb-4">
  //       <h3 className="text-lg font-semibold">License</h3>
  //       <Button
  //         variant="filled"
  //         title="Add New License"
  //         icon={ <Icon name='plus' color='red'></Icon>}
  //         isIconFirst
  //         className="px-3 py-1.5 rounded-xl"
  //         onClick={() => setIsFileUploadModalOpen(true)}
  //         type="button"
  //       />
  //     </div>

  //     <div>
  //       {dummyData.map((data, index) => (
  //         <LongCard
  //           key={`${data.title}-${index}`}
  //           data={data}
  //           isEnd={index === dummyData.length - 1}
  //           isEditable
  //           onEdit={() => setIsModalOpen("EDIT")}
  //         />
  //       ))}
  //     </div>
  //     <Modal
  //       isOpen={isFileUploadModalOpen}
  //       onClose={() => setIsFileUploadModalOpen(false)}
  //       title="Add Licenses"
  //       size="lg"
  //       closeButton={true}
  //     >
  //       <h3 className="text-sm  my-3">Add Licenses</h3>
  //       <FileUpload
  //         multiple={true}
  //         handelSubmit={(files) => console.log(files)}
  //         accept={"*/*"}
  //         className={""}
  //         NumberOfFileAllowed={2}
  //       />
  //     </Modal>
  //   </div>
  // );
};
