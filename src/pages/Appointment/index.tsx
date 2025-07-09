import CustomSelectTest from "@/stories/Common/CustomSelect/test";
import SwiperComponent from "@/stories/Common/Swiper";

const Appointment = () => {
  return (
    <div>
      <CustomSelectTest />
      <SwiperComponent autoplayDelay={3000} slidesPerView={1} spaceBetween={20}>
        {[
          <img src="https://picsum.photos/201" alt="slide1" />,
          <div className="bg-blue-200 h-48 flex items-center justify-center text-xl">Custom Content</div>,
          <img src="https://picsum.photos/203" alt="slide3" />,
        ]}
      </SwiperComponent>
    </div>
  );
};

export default Appointment;
