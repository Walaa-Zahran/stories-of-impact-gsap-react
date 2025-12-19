const Photos = () => {
  return (
    <section className="screen bg-dots" id="screen-4">
      <div className="impact">
        <div className="impact__center">
          <h2 className="title">
            <span className="title--thin">STORIES OF</span>
            <br />
            <span className="title--accent">IMPACT</span>
          </h2>

          <p className="subtitle">
            Behind every milestone is a story. These are the
            <br />
            changemakers driving Our VISION and the results speak
            <br />
            for themselves.
          </p>

          <div className="scroll-hint">
            <span className="scroll-hint__icon">⌄</span>
            <span className="scroll-hint__text">Scroll to learn more</span>
          </div>
        </div>

        <img
          className="impact__img impact__img--tl"
          src="assets/people-1.jpg"
          alt=""
        />
        <img
          className="impact__img impact__img--ml"
          src="assets/people-2.jpg"
          alt=""
        />
        <img
          className="impact__img impact__img--bl"
          src="assets/people-3.jpg"
          alt=""
        />

        <img
          className="impact__img impact__img--tr"
          src="assets/people-4.jpg"
          alt=""
        />
        <img
          className="impact__img impact__img--mr"
          src="assets/people-5.jpg"
          alt=""
        />
        <img
          className="impact__img impact__img--br"
          src="assets/people-6.jpg"
          alt=""
        />

        <img
          className="impact__img impact__img--bc"
          src="assets/people-7.jpg"
          alt=""
        />
        <img
          className="impact__img impact__img--bm1"
          src="assets/people-8.jpg"
          alt=""
        />
        <img
          className="impact__img impact__img--bm2"
          src="assets/people-9.jpg"
          alt=""
        />
      </div>
    </section>
  );
};

export default Photos;
