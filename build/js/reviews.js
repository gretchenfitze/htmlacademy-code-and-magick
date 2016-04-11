'use strict';

var filtersContainer = document.querySelector('.reviews-filter');
var reviewsContainer = document.querySelector('.reviews-list');
var templateElement = document.getElementById('review-template');
var elementToClone;
var filters = document.getElementsByName('reviews');
var reviewsBlock = document.querySelector('.reviews');

if ('content' in templateElement) {
  elementToClone = templateElement.content.querySelector('.review');
} else {
  elementToClone = templateElement.querySelector('.review');
}

/** @constant {number} */
var IMAGE_LOAD_TIMEOUT = 10000;

/** @constant {string} */
var REVIEWS_LOAD_URL = '//o0.github.io/assets/json/reviews.json';

/** @type {Array.<Object>} */
var reviews = [];

/** @enum {number} */
var Filter = {
  'ALL': 'all',
  'RECENT': 'reviews-recent',
  'GOOD': 'reviews-good',
  'BAD': 'reviews-bad',
  'POPULAR': 'reviews-popular'
};

/**
 * @param {Object} data
 * @param {HTMLElement} container
 * @return {HTMLElement}
 */
var getReviewElement = function(data, container) {
  var element = elementToClone.cloneNode(true);
  var author = data.author;
  element.querySelector('.review-rating').textContent = data.rating;

  // Исправление положения звёздочки рейтинга
  element.querySelector('.review-rating').style.backgroundPositionX = '10px';
  element.querySelector('.review-rating').style.backgroundRepeatX = 'no-repeat';
  element.querySelector('.review-rating').style.width = '40px';

  element.querySelector('.review-text').textContent = data.description;
  container.appendChild(element);

  var authorPicture = new Image();
  var pictureLoadTimeout;

  authorPicture.onload = function() {
    clearTimeout(pictureLoadTimeout);
    element.querySelector('img').setAttribute('src', author.picture);
    element.querySelector('img').setAttribute('width', '124px');
    element.querySelector('img').setAttribute('height', '124px');
  };

  authorPicture.onerror = function() {
    element.classList.add('review-load-failure');
  };

  authorPicture.src = author.picture;

  pictureLoadTimeout = setTimeout(function() {
    authorPicture.src = '';
    element.classList.add('review-load-failure');
  }, IMAGE_LOAD_TIMEOUT);

  return element;
};

/** @param {Array.<Object>} reviews */
var renderReviews = function(reviewsToRender) {
  reviewsContainer.innerHTML = '';

  reviewsToRender.forEach(function(review) {
    getReviewElement(review, reviewsContainer);
  });
};

/**
 * @param {Array.<Object>} hotels
 * @param {string} filter
 */
var getFilteredReviews = function(filteredReviews, filter) {
  var reviewsToFilter = reviews.slice(0);

  switch (filter) {
    case Filter.ALL:
      break;

    case Filter.RECENT:
      var recentReviews = reviewsToFilter.filter(function(review) {
        var currentDate = new Date();
        /** @constant {number} */
        var FIRST_DAY_REVIEW = 1000 * 60 * 60 * 24 * 14;
        return Date.parse(review.date + 'T00:00:00.001Z') > (currentDate - FIRST_DAY_REVIEW);
      });
      return recentReviews.sort(function(a, b) {
        return b.date - a.date;
      });

    case Filter.GOOD:
      var goodReviews = reviewsToFilter.filter(function(review) {
        return review.rating > 2;
      });
      return goodReviews.sort(function(a, b) {
        return b.rating - a.rating;
      });

    case Filter.BAD:
      var badReviews = reviewsToFilter.filter(function(review) {
        return review.rating < 3;
      });
      return badReviews.sort(function(a, b) {
        return a.rating - b.rating;
      });

    case Filter.POPULAR:
      reviewsToFilter.sort(function(a, b) {
        return b.review_usefulness - a.review_usefulness;
      });
      break;
  }
  return reviewsToFilter;
};

/** @param {string} filter */
var setFilterEnabled = function(filter) {
  var filteredReviews = getFilteredReviews(reviews, filter);
  renderReviews(filteredReviews);
};

var setFiltrationEnabled = function() {
  for (var i = 0; i < filters.length; i++) {
    filters[i].onclick = function() {
      setFilterEnabled(this.id);
    };
  }
};

/** @param {function(Array.<Object>)} callback */
var getReviews = function(callback) {
  var xhr = new XMLHttpRequest();

  xhr.onprogress = function() {
    reviewsBlock.classList.add('reviews-list-loading');
  };

  /** @param {ProgressEvent} evt */
  xhr.onloadend = function(evt) {
    clearTimeout(xhr.timeout);
    reviewsBlock.classList.remove('reviews-list-loading');
    var loadedData = JSON.parse(evt.target.response);
    callback(loadedData);
  };

  xhr.onerror = function() {
    reviewsBlock.classList.add('reviews-load-failure');
  };

  xhr.timeout = 10000;
  xhr.ontimeout = function() {
    reviewsBlock.classList.add('reviews-load-failure');
  };

  filtersContainer.classList.remove('invisible');
  xhr.open('GET', REVIEWS_LOAD_URL);
  xhr.send();
};

getReviews(function(loadedReviews) {
  reviews = loadedReviews;
  setFiltrationEnabled(true);
  setFilterEnabled(Filter.ALL);
});