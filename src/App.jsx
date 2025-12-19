import useStackedSections from "./hooks/useStackedSections";

import Headline from "./sections/Headline";
import Carousel from "./sections/Carousel";
import Title from "./sections/Title";
import Photos from "./sections/Photos";
import KeyFigures from "./sections/KeyFigures";
import CTA from "./sections/CTA";
import Quotes from "./sections/Quotes";

const App = () => {
  useStackedSections();

  return (
    <main className="page">
      <Photos />
      <Carousel />
      <KeyFigures />
      <Headline />
      <Title />
      <Quotes />
      <CTA />

      {/* creates scroll distance: one viewport per section */}
      <div
        className="scroll-spacer"
        style={{ ["--scrollH"]: `${(7 + 1) * 100}vh` }} // 7 sections + a little extra
      />
    </main>
  );
};

export default App;
