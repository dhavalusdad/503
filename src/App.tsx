import QueryProvider from "@/api/QueryProvider";
import SectionLoader from "@/stories/Common/Loader/Spinner";
import { Providers } from "@/redux/provider";
import Route from "@/routes";

const PreRoute = () => {
  const loader = false;

  console.log("PreRoute rendered, loader:", loader);

  if (!loader) {
    return <Route />;
  }

  return <SectionLoader />;
};

const App = () => {
  return (
    <QueryProvider>
      <Providers>
        <PreRoute />
      </Providers>
    </QueryProvider>
  );
};

export default App;
