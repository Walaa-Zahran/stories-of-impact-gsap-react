const CTA = () => {
  return (
    <section className="screen" id="screen-5">
      <div className="center-block">
        <h2 className="title">
          <span className="title--thin">JOIN THE VISION.</span>
          <br />
          <span className="title--accent">SHAPE THE FUTURE.</span>
        </h2>

        <p className="subtitle">
          These are just some of the faces behind Our VISION. Together, we’re
          <br />
          delivering real impact reflected in the numbers.
        </p>

        <div className="cta">
          <a className="btn btn--outline" href="#">
            ANNUAL REPORT
          </a>
          <a className="btn btn--solid" href="#">
            OUR VISION KPIS
          </a>
        </div>
      </div>

      <div className="progress">
        <span className="progress__track"></span>
        <span className="progress__fill"></span>
      </div>
    </section>
  );
};

export default CTA;
