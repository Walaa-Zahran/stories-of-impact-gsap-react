const KeyFigures = () => {
  return (
    <section className="screen" id="screen-4">
      <div className="figures">
        <div className="figures__rail">
          <article className="figure-card figure-card--active">
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

          <article className="figure-card figure-card--side">
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

          <article
            className="figure-card figure-card--ghost"
            aria-hidden="true"
          ></article>
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
