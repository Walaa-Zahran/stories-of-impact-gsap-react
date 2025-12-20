const Carousel = () => {
  return (
    <section className="screen" id="screen-2">
      <div className="carousel">
        <div className="carousel__track">
          <article className="story-card story-card--primary">
            <img className="story-card__img" src="assets/story-1.jpg" alt="" />
            <div className="story-card__overlay">
              <h3 className="story-card__title">From Purpose to Progress</h3>
              <p className="story-card__meta">Empowering Futures</p>
            </div>
          </article>

          <article className="story-card story-card--secondary">
            <img className="story-card__img" src="assets/story-2.jpg" alt="" />
            <div className="story-card__overlay">
              <h3 className="story-card__title">Vision Turned Venture</h3>
              <p className="story-card__meta">Innovative Journeys</p>
            </div>
          </article>

          <article className="story-card story-card--secondary">
            <img className="story-card__img" src="assets/story-3.jpg" alt="" />
            <div className="story-card__overlay">
              <h3 className="story-card__title">Built for Tomorrow</h3>
              <p className="story-card__meta">Creating Momentum</p>
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

export default Carousel;
