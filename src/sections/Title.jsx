const Title = () => {
  return (
    <section className="screen" id="screen-3">
      <div className="center-block">
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

      <div className="progress">
        <span className="progress__track"></span>
        <span className="progress__fill"></span>
      </div>
    </section>
  );
};

export default Title;
