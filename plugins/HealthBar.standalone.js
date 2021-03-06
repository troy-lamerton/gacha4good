/* global Phaser */
/**
 Copyright (c) 2015 Belahcen Marwane (b.marwane@gmail.com)

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.
*/

var HealthBar = function (game, providedConfig) {
  this.game = game

  this.setupConfiguration(providedConfig)
  this.setPosition(this.config.x, this.config.y)
  this.drawBackground()
  this.drawHealthBar()
  this.setPercent(this.config.percent, false)
  this.setFixedToCamera(this.config.isFixedToCamera)
}

HealthBar.prototype.constructor = HealthBar

HealthBar.prototype.setupConfiguration = function (providedConfig) {
  this.config = this.mergeWithDefaultConfiguration(providedConfig)
  this.flipped = this.config.flipped
}

HealthBar.prototype.mergeWithDefaultConfiguration = function (newConfig) {
  var defaultConfig = {
    width: 250,
    height: 40,
    x: 0,
    y: 0,
    bg: {
      color: 'red',
      strokeColor: '#555'
    },
    bar: {
      color: '#48ad05',
      strokeColor: '#555'
    },
    animationDuration: 400,
    flipped: false,
    isFixedToCamera: false,
    percent: 100
  }

  return mergeObjects(defaultConfig, newConfig)
}

function mergeObjects (targetObj, newObj) {
  for (var p in newObj) {
    try {
      targetObj[p] = newObj[p].constructor == Object ? mergeObjects(targetObj[p], newObj[p]) : newObj[p]
    } catch (e) {
      targetObj[p] = newObj[p]
    }
  }
  return targetObj
}

HealthBar.prototype.drawBackground = function () {
  var bmd = this.game.make.bitmapData(this.config.width, this.config.height)
  bmd.ctx.fillStyle = this.config.bg.color
  bmd.ctx.beginPath()
  bmd.ctx.rect(0, 0, this.config.width, this.config.height)
  bmd.ctx.fill()
  bmd.ctx.strokeStyle = this.config.bar.strokeColor
  bmd.ctx.lineWidth = 3
  bmd.ctx.stroke()

  this.bgSprite = this.game.add.sprite(this.x, this.y, bmd)
  this.bgSprite.anchor.x = 0.5

  if (this.flipped) {
    this.bgSprite.scale.x = -1
  }
}

HealthBar.prototype.drawHealthBar = function () {
  var bmd = this.game.make.bitmapData(this.config.width, this.config.height)
  bmd.ctx.fillStyle = this.config.bar.color
  bmd.ctx.beginPath()
  bmd.ctx.rect(0, 0, this.config.width, this.config.height)
  bmd.ctx.fill()
  bmd.ctx.strokeStyle = this.config.bar.strokeColor
  bmd.ctx.lineWidth = 3
  bmd.ctx.stroke()

  this.barSprite = this.game.add.sprite(0, 0, bmd)
  // this.barSprite.anchor.x = 0.5
}

HealthBar.prototype.setPosition = function (x, y) {
  this.x = x
  this.y = y

  if (this.bgSprite !== undefined && this.barSprite !== undefined) {
    this.bgSprite.position.x = x
    this.bgSprite.position.y = y

    this.barSprite.position.x = x - this.config.width / 2 - (this.bgSprite.anchor.x * this.bgSprite.width)
    this.barSprite.position.y = y
  }
}

HealthBar.prototype.setPercent = function (newValue, tween = true) {
  if (newValue < 0) newValue = 0
  if (newValue > 100) newValue = 100

  var newWidth = (newValue * this.config.width) / 100
  var oldWidth = this.barSprite.width;

  if (tween) {
    if (newWidth < oldWidth) {
      // health decreasing
      this.tweenWidthTo(newWidth, true)
    } else {
      this.tweenWidthTo(newWidth)
    }
  } else {
    this.setWidth(newWidth)
  }
}

HealthBar.prototype.tweenWidthTo = function (newWidth, hurting) {
  if (hurting) {
    // Health bar flashes, flash a darker color
    this.game.add.tween(this.barSprite).to({ tint: 0xffa0a0 }, Math.min(this.config.animationDuration, 80), Phaser.Easing.None, true, 0, 0, true) // last arg is yoyo=true
  }
  this.game.add.tween(this.barSprite).to({ width: newWidth }, this.config.animationDuration, Phaser.Easing.Quadratic.Out, true)
}

HealthBar.prototype.setWidth = function (newWidth) {
  this.barSprite.width = newWidth
}

HealthBar.prototype.setFixedToCamera = function (fixedToCamera) {
  this.bgSprite.fixedToCamera = fixedToCamera
  this.barSprite.fixedToCamera = fixedToCamera
}

HealthBar.prototype.kill = function () {
  this.bgSprite.kill()
  this.barSprite.kill()
}

HealthBar.prototype.getBarSprite = function () {
  // position the bar showing current hp at the same left as the background sprite
  this.barSprite.position.x = ((this.config.flipped) ? +1 : -1) * (this.bgSprite.x - this.bgSprite.left)
  this.bgSprite.addChild(this.barSprite)
  return this.bgSprite
}
