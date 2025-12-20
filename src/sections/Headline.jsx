const Headline = () => {
  return (
    <section className="screen" id="screen-1">
      <div className="center-block">
        <h1 className="title">
          <span className="title--thin">THEIR STORIES. OUR</span>
          <br />
          <span className="title--accent">PROGRESS.</span>
        </h1>

        <p className="subtitle">
          These are just some of the faces behind Our VISION. Together, we’re
          <br />
          delivering real impact reflected in the numbers.
        </p>
      </div>

      <div className="progress">
        <span className="progress__track"></span>
        <span className="progress__fill"></span>
      </div>
    </section>
  );
};

export default Headline;
