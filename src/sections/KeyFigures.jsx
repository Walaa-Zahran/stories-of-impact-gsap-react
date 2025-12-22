const KeyFigures = () => {
  return (
    <section className="screen bg-dots" id="screen-4">
      <div className="figures">
        <div className="figures__rail figures__rail--floating">
          <article className="figure-card figure-card--pos pos-1 figure-card--active">
            <div className="figure-card__body">
              <div className="figure-card__value">
                65.4<span className="figure-card__unit">%</span>
              </div>
              <div className="figure-card__label">SAUDI HOME OWNERSHIP</div>
              <p className="figure-card__desc">
                A specific set of machine-readable public information that is
                publicly available, free of charge, without any restriction.
              </p>
            </div>
          </article>

          <article className="figure-card figure-card--pos pos-2 figure-card--side">
            <div className="figure-card__body">
              <div className="figure-card__value">08</div>
              <div className="figure-card__label">
                NUMBER OF SAUDI SITES
                <br />
                ON UNESCO WORLD
                <br />
                HERITAGE LIST
              </div>
              <p className="figure-card__desc">
                A specific set of machine-readable public information that is
                publicly available, free of charge, without any restriction.
              </p>
            </div>
          </article>

          <article className="figure-card figure-card--pos pos-3 figure-card--side">
            <div className="figure-card__body" style={{ padding: "30px" }}>
              <div className="figure-card__value">
                65.4<span className="figure-card__unit">%</span>
              </div>
              <div className="figure-card__label">SAUDI HOME OWNERSHIP</div>
              <p className="figure-card__desc">
                A specific set of machine-readable public information that is
                publicly available, free of charge, without any restriction.
              </p>
            </div>
          </article>

          <article className="figure-card figure-card--pos pos-4 figure-card--side">
            <div className="figure-card__body" style={{ padding: "10px" }}>
              <div className="figure-card__value">
                65.4<span className="figure-card__unit">%</span>
              </div>
              <div className="figure-card__label">SAUDI HOME OWNERSHIP</div>
              <p className="figure-card__desc">
                A specific set of machine-readable public information that is
                publicly available, free of charge, without any restriction.
              </p>
            </div>
          </article>
        </div>
      </div>

      <div className="progress">
        <span className="progress__track"></span>
        <span className="progress__fill"></span>
      </div>
    </section>
  );
};

export default KeyFigures;
