import { Icon } from "@/stories/Common";

export const Footer = () => {
  return (
    <div className="bg-Gray pt-60px">
      <div className="container mx-auto">
        <div className="flex justify-between gap-10">
          <div className="relative w-[30%]">
            <Icon name="logo" />
            <p className="mt-30px text-lg leading-7 font-normal text-primarygray">
              Equitable Access to High-Quality Mental HealthCare. Our
              revolutionary Telehealth model enables us to deliver high-quality
              mental health care to
            </p>
            <h6 className="text-xl font-semibold leading-6 mt-2.5 text-primary">
              Anyone, Anytime, Anywhere.
            </h6>
          </div>
          <div className="relative">
            <h3 className="text-2xl font-bold leading-6 text-primary mb-30px">
              Reach Us Out
            </h3>
            <ul className="p-0 flex flex-col gap-5">
              <li className="pl-0 flex items-center gap-2.5 cursor-pointer">
                <Icon name="mail" className="text-blackdark" />
                <a
                  href="mailto:info@cytipsych.com"
                  className="text-lg leading-18px font-normal text-blackdark"
                >
                  info@cytipsych.com
                </a>
              </li>
              <li className="pl-0 flex items-center gap-2.5 cursor-pointer">
                <Icon name="phone" className="text-blackdark" />
                <a
                  href="tel:866-478-3978"
                  className="text-lg leading-18px font-normal text-blackdark"
                >
                  866-478-3978
                </a>
              </li>
              <li className="pl-0 flex items-center gap-2.5 cursor-pointer">
                <Icon name="website" className="text-blackdark" />
                <span className="text-lg leading-18px font-normal text-blackdark">
                  Cyticlinics Website
                </span>
              </li>
            </ul>
          </div>
          <div className="relative">
            <h3 className="text-2xl font-bold leading-6 text-primary mb-30px">
              Follow Us On
            </h3>
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-55px h-55px rounded-10px border border-solid border-blackdark cursor-pointer">
                <Icon name="facebook" />
              </div>
              <div className="flex items-center justify-center w-55px h-55px rounded-10px border border-solid border-blackdark cursor-pointer">
                <Icon name="instagram" />
              </div>
            </div>
          </div>
          <div className="flex flex-col gap-2.5">
            <img src="src/assets/images/image1.png" />
            <img src="src/assets/images/image2.png" />
          </div>
        </div>
        <div className="mt-60px flex items-center justify-center border-t border-solid border-primarylight pt-5 pb-30px relative">
          <p className="text-base leading-4 font-normal text-primarygray">
            © Copyright Cyti Clinics. All rights reserved.
          </p>
          <p className="absolute right-0 cursor-pointer text-base leading-4 font-normal text-primarygray">
            Terms & Conditions
          </p>
        </div>
      </div>
    </div>
  );
};

export default Footer;
