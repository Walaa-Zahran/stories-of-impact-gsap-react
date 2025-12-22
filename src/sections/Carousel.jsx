const Carousel = () => {
  return (
    <section className="screen bg-dots" id="screen-2" data-back="0">
      <div className="carousel">
        <div className="carousel__track">
          <div className="carousel__bgText" aria-hidden="true">
            <div className="carousel__bgTextInner">
              <h2 className="carousel__bgLine">THE STORIES. OUR</h2>
              <p className="carousel__bgLine">PROGRESS.</p>

              <p className="carousel_paragraph">
                These are just some of the faces behind Our VISION. Together,
                we’re delivering real impact reflected in the numbers.
              </p>
            </div>
          </div>

          <article
            className="story-card story-card--back back-1"
            aria-hidden="true"
          >
            <img
              className="story-card__img"
              src="assets/images/carousel-3.png"
              alt=""
            />
          </article>

          <article
            className="story-card story-card--back back-2"
            aria-hidden="true"
          >
            <img
              className="story-card__img"
              src="assets/images/carousel-4.png"
              alt=""
            />
          </article>

          <article className="story-card story-card--primary">
            <img
              className="story-card__img"
              src="assets/images/carousel-1.png"
              alt=""
            />
            <div className="story-card__overlay" style={{ bottom: "42px" }}>
              <h3 className="story-card__title">From Purpose to Progress</h3>
              <p className="story-card__meta">Empowering Futures</p>
            </div>
          </article>

          <article className="story-card story-card--secondary right">
            <img
              className="story-card__img"
              src="assets/images/carousel-2.png"
              alt=""
            />
            <div className="story-card__overlay">
              <h3 className="story-card__title">Vision Turned Venture</h3>
              <p className="story-card__meta">Innovative Journeys</p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
};

export default Carousel;
