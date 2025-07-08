import { Icon } from "@/stories/Common";
import Header from "./Header";
import Footer from "./Footer";

const Landing = () => {
  return (
    <>
      <section className="bg-primarylight w-full pt-10 pb-100px">
        <div className="container mx-auto">
          <Header />
          <div className="pt-100px flex gap-24">
            <div className="w-2/4">
              <div className="relative flex flex-col gap-5">
                <div className="text-white absolute right-12 -top-2">
                  <Icon name="loading" />
                </div>
                <h1 className="text-64px leading-20 font-bold text-primary">
                  Therapy that fits your life, on your schedule
                </h1>
                <p className="text-xl leading-7 font-normal text-blackdark">
                  We’re glad you’re here. Please use the filters below to view
                  our therapists and schedule online. Or Let Us Match You and we
                  will reach out to personally match you with your ideal
                  therapist
                </p>
              </div>
              <div className="flex flex-col gap-5 w-85%">
                <div className="grid grid-cols-2 gap-5 mt-10">
                  <input
                    type="text"
                    placeholder="State"
                    className="bg-white py-4 px-5 rounded-10px placeholder:text-primarygray text-blackdark text-lg font-normal leading-18px focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Payment Method"
                    className="bg-white py-4 px-5 rounded-10px placeholder:text-primarygray text-blackdark text-lg font-normal leading-18px focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Therapy Type"
                    className="bg-white py-4 px-5 rounded-10px placeholder:text-primarygray text-blackdark text-lg font-normal leading-18px focus:outline-none"
                  />
                  <input
                    type="text"
                    placeholder="Focus Area"
                    className="bg-white py-4 px-5 rounded-10px placeholder:text-primarygray text-blackdark text-lg font-normal leading-18px focus:outline-none"
                  />
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <button className="flex items-center gap-2.5 px-3.5 py-2 rounded-10px bg-blackdark text-white cursor-pointer text-base font-normal leading-4">
                    Oregon
                    <Icon name="close" />
                  </button>
                  <button className="flex items-center gap-2.5 px-3.5 py-2 rounded-10px bg-blackdark text-white cursor-pointer text-base font-normal leading-4">
                    Self Pay
                    <Icon name="close" />
                  </button>
                  <button className="flex items-center gap-2.5 px-3.5 py-2 rounded-10px bg-blackdark text-white cursor-pointer text-base font-normal leading-4">
                    Families
                    <Icon name="close" />
                  </button>
                  <button className="flex items-center gap-2.5 px-3.5 py-2 rounded-10px bg-blackdark text-white cursor-pointer text-base font-normal leading-4">
                    Anxiety
                    <Icon name="close" />
                  </button>
                  <button className="flex items-center gap-2.5 px-3.5 py-2 rounded-10px bg-blackdark text-white cursor-pointer text-base font-normal leading-4">
                    Bipolar
                    <Icon name="close" />
                  </button>
                  <button className="flex items-center gap-2.5 px-3.5 py-2 rounded-10px bg-blackdark text-white cursor-pointer text-base font-normal leading-4">
                    Depression
                    <Icon name="close" />
                  </button>
                  <button className="text-base font-normal text-blackdark cursor-pointer leading-4">
                    Clear All
                  </button>
                </div>
                <button className="bg-primary w-full rounded-10px flex items-center justify-center gap-2.5 py-4 text-white text-lg font-semibold leading-18px cursor-pointer">
                  <Icon name="search" />
                  <span>Search</span>
                </button>
              </div>
            </div>
            <div className="w-2/4">
              <div className="w-full">
                <img src="src/assets/images/businesswoman-greeting-coworker.png" />
              </div>
            </div>
          </div>
        </div>
      </section>
      <section className="my-100px">
        <div className="container mx-auto">
          <div className="flex items-center justify-between mb-60px">
            <h2 className="text-5xl font-bold leading-14 text-primary">
              Search Results
            </h2>
            <div className="flex items-center gap-2.5">
              <p className="px-5 py-2.5 border border-solid border-surface rounded-10px">
                Gender
              </p>
              <p className="px-5 py-2.5 border border-solid border-surface rounded-10px">
                Availability
              </p>
              <p className="px-5 py-2.5 border border-solid border-surface rounded-10px">
                Language
              </p>
              <p className="px-5 py-2.5 border border-solid border-surface rounded-10px">
                Session Type
              </p>
              <p className="px-5 py-2.5 border border-solid border-surface rounded-10px">
                Sort By
              </p>
            </div>
          </div>
          <div className="grid grid-cols-4 gap-7">
            <div className="relative border border-solid border-surface rounded-20px">
              <div className="w-full h-48 bg-Gray">
                <img
                  className="w-full h-full objact-contain"
                  src="src/assets/images/Rectangle1.png"
                />
              </div>
              <div className="p-5 flex flex-col gap-7">
                <div className="flex flex-col gap-2.5">
                  <h4>Dr. Jane Smith</h4>
                  <p>Mental Health Therapist</p>
                </div>
                <div className="flex flex-col gap-2.5">
                  <span>June 30, 2025</span>
                  <div className="flex items-center gap-2.5 justify-between">
                    <p className="text-base leading-4 font-normal text-blackdark rounded-md border border-solid border-primarygray px-3 py-2">
                      9:00 AM
                    </p>
                    <p className="text-base leading-4 font-normal text-blackdark rounded-md border border-solid border-primarygray px-3 py-2">
                      9:00 AM
                    </p>
                    <p className="text-base leading-4 font-normal text-blackdark rounded-md border border-solid border-primarygray px-3 py-2">
                      9:00 AM
                    </p>
                    <div className="bg-blackdark px-2 py-5px rounded-md text-white">
                      <Icon name="calendar" className="w-6 h-6 icon-wrapper" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Landing;
