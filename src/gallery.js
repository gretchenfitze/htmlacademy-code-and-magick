'use strict';

(function() {
  var utilities = require('./utilities');

  /**
  * @type {Array.<string>} pictures
  */
  var galleryImages = [];

  /**
  * @param {Array.<string>} pictures
  */
  var getGallery = function(pictures) {
    galleryImages = pictures;
    var photogallerySection = document.querySelector('.photogallery');
    var galleryPictures = photogallerySection.getElementsByTagName('img');
    for (var pic = 0; pic < galleryPictures.length; pic++) {
      galleryImages[pic] = galleryPictures[pic].getAttribute('src');
    }
  };

  /**
  * @constructor
  */
  var Gallery = function() {
    var self = this;
    getGallery(galleryImages);

    var changePhotoHash = function(src) {
      history.replaceState(null, null, '#photo/' + src);
    };

    this.getActivePicture = function() {
      for (var i = 0; i < self.photogalleryBlock.length; i++) {
        (function(pict) {
          self.photogalleryBlock[i].addEventListener('click', function() {
            self.activePictureIndex = pict;
          });
        })(i);
      }
      self.activePictureUrl = galleryImages[self.activePictureIndex];
    };

    /**
    * @param {number} picture
    */
    this.showActivePicture = function(picture) {
      self.previewsContainer.innerHTML = '';
      var preview = new Image();
      if (isNaN(picture)) {
        preview.src = picture;
        changePhotoHash(picture);
      } else {
        preview.src = galleryImages[picture];
        changePhotoHash(galleryImages[picture]);
        self.activePictureIndex = galleryImages.indexOf(self.activePictureUrl);
      }
      self.previewsContainer.appendChild(preview);
    };

    /**
    * @param {KeyboardEvent} event
    */
    this._onDocumentKeyDown = function(event) {
      if (event.keyCode === 27) {
        self.hideGalllery();
      }
    };

    this._onCloseClick = function() {
      self.hideGalllery();
    };

    this.checkControls = function() {
      if (self.activePictureIndex < 1) {
        utilities.hideElement(this.controlLeft);
      } else {
        utilities.showElement(this.controlLeft);
      }

      if (self.activePictureIndex >= (galleryImages.length - 1)) {
        utilities.hideElement(this.controlRight);
      } else {
        utilities.showElement(this.controlRight);
      }
    };

    this._onClickControlLeft = function() {
      self.activePictureIndex--;
      self.checkControls();
      changePhotoHash(galleryImages[self.activePictureIndex]);
      self.showActivePicture(galleryImages[self.activePictureIndex]);
    };

    this._onClickControlRight = function() {
      self.activePictureIndex++;
      self.checkControls();
      changePhotoHash(galleryImages[self.activePictureIndex]);
      self.showActivePicture(galleryImages[self.activePictureIndex]);
    };

    this.controlLeft.addEventListener('click', self._onClickControlLeft);
    this.controlRight.addEventListener('click', self._onClickControlRight);

    this.hideGalllery = function() {
      utilities.hideElement(self.galleryContainer);
      self.closeGallery.removeEventListener('click', self._onCloseClick);
      document.removeEventListener('keydown', self._onDocumentKeyDown);
      history.replaceState(null, null, '#');
    };

    this.galleryActivate = function() {
      document.addEventListener('keydown', self._onDocumentKeyDown);
      self.closeGallery.addEventListener('click', self._onCloseClick);
      self.checkControls();
      self.showActivePicture(self.activePictureUrl);
      utilities.showElement(self.galleryContainer);
    };

    for (var i = 0; i < this.photogalleryBlock.length; i++) {
      this.getActivePicture();
      this.photogalleryBlock[i].addEventListener('click', function() {
        self.getActivePicture();
        self.galleryActivate();
        window.addEventListener('hashchange', self.galleryActivate);
      });
    }
    if (location.hash.match(/#photo\/(\S+)/)) {
      self.activePictureUrl = location.hash.match(/#photo\/(\S+)/)[1];
      self.activePictureIndex = galleryImages.indexOf(self.activePictureUrl);
      self.galleryActivate();
    }
  };

  Gallery.prototype = {
    galleryContainer: document.querySelector('.overlay-gallery'),
    controlLeft: document.querySelector('.overlay-gallery-control-left'),
    controlRight: document.querySelector('.overlay-gallery-control-right'),
    closeGallery: document.querySelector('.overlay-gallery-close'),
    previewsContainer: document.querySelector('.overlay-gallery-preview'),
    photogalleryBlock: document.querySelectorAll('.photogallery-image')
  };

  module.exports = new Gallery();
})();
