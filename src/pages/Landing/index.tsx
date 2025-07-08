import Icon from "@/components/common/Icon";
import Header from "./Header";
import Footer from "./Footer";
import clsx from "clsx";

const Landing = () => {
  const therapists = [
    {
      name: "Dr. Jane Smith",
      role: "Mental Health Therapist",
      image: "src/assets/images/Rectangle1.png",
      times: ["9:00 AM", "9:30 AM", "10:00 AM"],
    },
    {
      name: "Dr. Michael Brown",
      role: "Psychologist",
      image: "src/assets/images/Rectangle4.png",
      times: [],
    },
    {
      name: "Dr. Jane Smith",
      role: "Mental Health Therapist",
      image: "src/assets/images/Rectangle1.png",
      times: ["9:00 AM", "9:30 AM", "10:00 AM"],
    },
    {
      name: "Dr. Michael Brown",
      role: "Psychologist",
      image: "src/assets/images/Rectangle4.png",
      times: [],
    },
    {
      name: "Dr. Jane Smith",
      role: "Mental Health Therapist",
      image: "src/assets/images/Rectangle1.png",
      times: ["9:00 AM", "9:30 AM", "10:00 AM"],
    },
    {
      name: "Dr. Michael Brown",
      role: "Psychologist",
      image: "src/assets/images/Rectangle4.png",
      times: [],
    },
  ];

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
            <div className="w-2/4 relative">
              <div className="w-full">
                <img src="src/assets/images/businesswoman-greeting-coworker.png" />
              </div>
              <div className="absolute bottom-28 -left-[85px] bg-white p-5 rounded-2xl w-363px shadow-content">
                <div className="flex flex-col gap-5">
                  <h4 className="text-xl leading-5 font-bold text-blackdark">
                    Need Help Choosing a Therapist?
                  </h4>
                  <p className="text-base font-medium leading-6 text-primarygray">
                    We’re here to walk you through it. If you’re unsure who to
                    pick, just give us a quick call — we’ll match you
                    personally.
                  </p>
                  <div className="inline-block">
                    <button className="inline-flex items-center justify-center gap-2.5 py-2.5 px-3 rounded-lg bg-primary border border-solid border-black/20 text-white text-sm leading-4 font-bold">
                      <Icon name="phone" />
                      <span>Talk to a Care Coordinator</span>
                    </button>
                  </div>
                </div>
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
            {therapists.map((item, index) => (
              <div
                key={index}
                className="relative border border-solid border-surface rounded-20px group"
              >
                <div className="relative">
                  <div className="w-full h-48 bg-Gray">
                    <img
                      className="w-full h-full object-contain"
                      src={item.image}
                      alt={item.name}
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex flex-col gap-2.5">
                      <h4 className="text-lg font-bold text-blackdark leading-18px">
                        {item.name}
                      </h4>
                      <p className="text-base font-normal leading-4 text-primarygray">
                        {item.role}
                      </p>
                    </div>

                    <div className="bg-surface my-3.5 w-full h-1px" />

                    <div className="flex flex-col gap-2.5">
                      <span className="text-base font-medium leading-4 text-blackdark">
                        {item.times.length
                          ? "June 30, 2025"
                          : "Today’s Available Times"}
                      </span>

                      <div className="flex items-center gap-2.5 justify-between">
                        {item.times.length ? (
                          item.times.map((time, idx) => (
                            <p
                              key={idx}
                              className="text-sm leading-4 font-normal text-blackdark rounded-md border border-solid border-primarygray px-3 py-2"
                            >
                              {time}
                            </p>
                          ))
                        ) : (
                          <p className="text-base leading-4 font-normal text-blackdark px-3 py-2">
                            No Slot Available
                          </p>
                        )}
                        {item.times.length > 1 && (
                          <div
                            className={clsx(
                              "bg-blackdark px-2 py-5px rounded-md text-white"
                            )}
                          >
                            <Icon
                              name="calendar"
                              className="w-6 h-6 icon-wrapper"
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-surface my-3.5 w-full h-1px" />
                    <button
                      className={clsx(
                        "cursor-pointer p-3.5 w-full rounded-lg text-lg font-bold leading-18px border border-solid border-black/20",
                        item.times.length
                          ? "bg-primary text-white"
                          : "bg-Greenlight text-white"
                      )}
                    >
                      {item.times.length ? "Book Now" : "Request Sent"}
                    </button>
                  </div>
                </div>

                {/* Hover Card */}
                <div
                  className={clsx(
                    "hidden group-hover:block bg-white rounded-20px p-5 w-332px absolute top-0 shadow-content z-10",
                    index % 4 === 3 ? "right-full -mr-2" : "left-full -ml-2"
                  )}
                >
                  <div
                    className={clsx(
                      "absolute top-1/4 text-white",
                      index % 4 === 3 ? "-right-4 rotate-180" : "-left-4"
                    )}
                  >
                    <Icon name="arrow" />
                  </div>
                  <div className="relative">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-full">
                        <img
                          className="w-full h-full object-cover rounded-full"
                          src={item.image}
                        />
                      </div>
                      <div className="flex flex-col gap-2.5">
                        <h4 className="text-base font-bold text-blackdark leading-4">
                          {item.name}
                        </h4>
                        <p className="text-sm font-normal leading-3.5 text-primarygray">
                          {item.role}
                        </p>
                      </div>
                    </div>
                    <div className="bg-surface my-3.5 w-full h-1px" />
                    <div className="flex flex-col gap-2.5">
                      <p className="text-sm font-normal leading-21px text-blackdark">
                        <strong>Area of Expertise:</strong> Anxiety, Trauma,
                        Couples Therapy
                      </p>
                      <p className="text-sm font-normal leading-21px text-blackdark">
                        <b>Years of Experience / Practice:</b> 12 Years
                      </p>
                      <p className="text-base font-normal leading-21px text-blackdark">
                        Hello! I'm Dr. Jane Smith a dedicated Mental Health
                        Therapist with over 10 years of experience helping
                        patients achieve better health and wellness. I believe
                        in a personalized, compassionate approach to care,
                        combining the latest medical techniques with genuine
                        support for every patient’s journey. Whether you're
                        recovering from an injury or working towards better
                        overall health, I'm here to guide and empower you every
                        step of the way...
                        <span className="cursor-pointer font-bold">
                          See More
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default Landing;
