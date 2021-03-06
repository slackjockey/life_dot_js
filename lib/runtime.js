class Runtime {

  constructor(cfg) {
    this.configuration = cfg;

    // Initialize our runtime and start execution.
    var field = new Field(cfg.fieldWidth, cfg.fieldHeight, cfg.fieldScale);
    field.randomize(cfg.numCells);

    this.renderTarget = cfg.renderTarget;

    this.instance = new Game(field);

    this.configuration.frameInterval = parseInt(1000 / cfg.fps) || 0;
    this.configuration.lastRenderTimestamp = 0;
    this.configuration.frameCount = 0;
  }

  start() {
    this.configuration.loop = true;
    this.triggerNextFrame();
  }

  triggerNextFrame() {
    this.frameId = window.requestAnimationFrame(this.renderLoop.bind(this));
  }

  stop() {
    if (this.configuration.loop != false) {
      this.configuration.loop = false;
      this.frameId = window.cancelAnimationFrame(this.frameId);
      console.log('stopped');
    }
  }

  renderLoop(now) {
    var timeElapsed = Date.now() - this.configuration.lastRenderTimestamp;

    if (timeElapsed > this.configuration.frameInterval) {

      this.configuration.lastRenderTimestamp = Date.now();
      this.instance.processField()
        .then(function(results) {
          // apply processed data to our field.
          this.instance.field.digestRawData(results);

        }.bind(this))
        .then(function() {
          this.instance.renderField(this.renderTarget)
            .then(function(buffer) {
              // draw our rendered buffer to the screen.
              this.renderTarget.getContext('2d').drawImage(buffer, 0, 0);

              this.configuration.frameCount++;
              console.log('rendered frame #' + this.configuration.frameCount.toString() +
                ' in ' + (Date.now() - this.configuration.lastRenderTimestamp) + 'ms');

            }.bind(this));

        }.bind(this));

    }

    if (this.configuration.loop) {
      this.triggerNextFrame();
    } else {
      console.log('stopped after frame #' + this.configuration.frameCount);
    }

  }

}
