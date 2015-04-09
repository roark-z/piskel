(function () {
  var ns = $.namespace('pskl.model.frame');

  ns.AsyncCachedFrameProcessor = function (cacheResetInterval) {
    ns.CachedFrameProcessor.call(this, cacheResetInterval);
  };


  pskl.utils.inherit(ns.AsyncCachedFrameProcessor, ns.CachedFrameProcessor);

  /**
   * Retrieve the processed frame from the cache, in the (optional) namespace
   * If the first level cache is empty, attempt to clone it from 2nd level cache. If second level cache is empty process the frame.
   * @param  {pskl.model.Frame} frame
   * @param  {String} namespace
   * @return {Object} the processed frame
   */
  ns.AsyncCachedFrameProcessor.prototype.get = function (frame, callback, namespace) {
    var processedFrame = null;
    namespace = namespace || this.defaultNamespace;

    if (!this.cache_[namespace]) {
      this.cache_[namespace] = {};
    }

    var cache = this.cache_[namespace];

    var firstCacheKey = frame.getHash();
    if (cache[firstCacheKey]) {
      processedFrame = cache[firstCacheKey];
    } else {
      var framePixels = JSON.stringify(frame.getPixels());
      var secondCacheKey = pskl.utils.hashCode(framePixels);
      if (cache[secondCacheKey]) {
        processedFrame = this.outputCloner(cache[secondCacheKey], frame);
        cache[firstCacheKey] = processedFrame;
      } else {
        this.frameProcessor(frame, this.onFrameProcessorComplete.bind(this, callback, cache, firstCacheKey, secondCacheKey));
      }
    }

    if (processedFrame) {
      callback(processedFrame);
    }
  };

  ns.AsyncCachedFrameProcessor.prototype.onFrameProcessorComplete = function (callback, cache, firstCacheKey, secondCacheKey, processedFrame) {
    cache[secondCacheKey] = processedFrame;
    cache[firstCacheKey] = processedFrame;
    callback(processedFrame);
  }
})();