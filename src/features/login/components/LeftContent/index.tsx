import SwiperComponent from "@/stories/Common/Swiper";
import Slider1 from "@/assets/images/slider1.png";
import Slider2 from "@/assets/images/slider2.png";
import Slider3 from "@/assets/images/slider3.png";
import Slider4 from "@/assets/images/slider4.png";
import Slider5 from "@/assets/images/slider5.png";
import Slider6 from "@/assets/images/slider6.png";
import Slider7 from "@/assets/images/slider7.png";
import Slider8 from "@/assets/images/slider8.png";
import Slider9 from "@/assets/images/slider9.png";
import Slider10 from "@/assets/images/slider10.png";
import Slider11 from "@/assets/images/slider11.png";
import Slider12 from "@/assets/images/slider12.png";
import { Image } from "@/stories/Common";

export const LeftContent = () => {
  return (
    <SwiperComponent autoplayDelay={5000} slidesPerView={1} spaceBetween={0}>
      {[
        <Image imgPath={Slider1} className="w-full" />,
        <Image imgPath={Slider2} className="w-full" />,
        <Image imgPath={Slider3} className="w-full" />,
        <Image imgPath={Slider4} className="w-full" />,
        <Image imgPath={Slider5} className="w-full" />,
        <Image imgPath={Slider6} className="w-full" />,
        <Image imgPath={Slider7} className="w-full" />,
        <Image imgPath={Slider8} className="w-full" />,
        <Image imgPath={Slider9} className="w-full" />,
        <Image imgPath={Slider10} className="w-full" />,
        <Image imgPath={Slider11} className="w-full" />,
        <Image imgPath={Slider12} className="w-full" />,
      ]}
    </SwiperComponent>
  );
};

export default LeftContent;
