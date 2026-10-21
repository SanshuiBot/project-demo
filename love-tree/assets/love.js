/**
 * love.js —— Canvas 绘制引擎（纯原生，无第三方依赖）
 * 对外只暴露 window.Tree；动画时序编排与配置读取见 main.js / config.js。
 */
(function (window) {
  "use strict";

  function random(min, max) {
    return min + Math.floor(Math.random() * (max - min + 1));
  }

  function bezier(cp, t) {
    var p1 = cp[0].mul((1 - t) * (1 - t));
    var p2 = cp[1].mul(2 * t * (1 - t));
    var p3 = cp[2].mul(t * t);
    return p1.add(p2).add(p3);
  }

  function inheart(x, y, r) {
    // x^2+(y-(x^2)^(1/3))^2 = 1
    // http://www.wolframalpha.com/input/?i=x%5E2%2B%28y-%28x%5E2%29%5E%281%2F3%29%29%5E2+%3D+1
    var z =
      ((x / r) * (x / r) + (y / r) * (y / r) - 1) *
        ((x / r) * (x / r) + (y / r) * (y / r) - 1) *
        ((x / r) * (x / r) + (y / r) * (y / r) - 1) -
      (x / r) * (x / r) * (y / r) * (y / r) * (y / r);
    return z < 0;
  }

  var Point = function (x, y) {
    this.x = x || 0;
    this.y = y || 0;
  };
  Point.prototype = {
    clone: function () {
      return new Point(this.x, this.y);
    },
    add: function (o) {
      var p = this.clone();
      p.x += o.x;
      p.y += o.y;
      return p;
    },
    sub: function (o) {
      var p = this.clone();
      p.x -= o.x;
      p.y -= o.y;
      return p;
    },
    div: function (n) {
      var p = this.clone();
      p.x /= n;
      p.y /= n;
      return p;
    },
    mul: function (n) {
      var p = this.clone();
      p.x *= n;
      p.y *= n;
      return p;
    },
  };

  var Heart = function () {
    // x = 16 sin^3 t
    // y = 13 cos t - 5 cos 2t - 2 cos 3t - cos 4t
    // http://www.wolframalpha.com/input/?i=x+%3D+16+sin%5E3+t%2C+y+%3D+(13+cos+t+-+5+cos+2t+-+2+cos+3t+-+cos+4t)
    var points = [],
      x,
      y,
      t;
    for (var i = 10; i < 30; i += 0.2) {
      t = i / Math.PI;
      x = 16 * Math.pow(Math.sin(t), 3);
      y = 13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t);
      points.push(new Point(x, y));
    }
    this.points = points;
    this.length = points.length;
  };
  Heart.prototype = {
    get: function (i, scale) {
      return this.points[i].mul(scale || 1);
    },
  };

  /* ===== 心形种子（可点击的“点我发芽”，含缩小、下落逻辑） ===== */
  var Seed = function (tree, point, scale, color, hint, clearMargin, hoverRange) {
    this.tree = tree;

    scale = scale > 0 ? scale : 1;
    color = typeof color === "string" && color ? color : "#FF0000";
    // 提示文字 / 擦除边距 / 热区范围均来自 config.js（main.js 透传），
    // 这里再做一层兜底，保证单独使用 love.js 时也合法
    this.hint = typeof hint === "string" ? hint : "点我发芽";
    this.clearMargin = clearMargin > 0 ? clearMargin : 90;
    this.hoverRange = hoverRange > 0 ? hoverRange : 260;

    this.heart = {
      point: point,
      scale: scale,
      color: color,
      figure: new Heart(),
    };

    this.circle = {
      point: point,
      scale: scale,
      color: color,
      radius: 5,
    };
  };
  Seed.prototype = {
    draw: function () {
      this.drawHeart();
      this.drawText();
    },
    addPosition: function (x, y) {
      this.circle.point = this.circle.point.add(new Point(x, y));
    },
    canMove: function () {
      return this.circle.point.y < this.tree.height + 20;
    },
    move: function (x, y) {
      this.clear();
      this.drawCirle();
      this.addPosition(x, y);
    },
    canScale: function () {
      return this.heart.scale > 0.2;
    },
    setHeartScale: function (scale) {
      this.heart.scale *= scale;
    },
    scale: function (scale) {
      this.clear();
      this.drawCirle();
      this.drawHeart();
      this.setHeartScale(scale);
    },
    drawHeart: function () {
      var ctx = this.tree.ctx,
        heart = this.heart;
      var point = heart.point,
        color = heart.color,
        scale = heart.scale;
      ctx.save();
      ctx.fillStyle = color;
      ctx.translate(point.x, point.y);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (var i = 0; i < heart.figure.length; i++) {
        var p = heart.figure.get(i, scale);
        ctx.lineTo(p.x, -p.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    drawCirle: function () {
      var ctx = this.tree.ctx,
        circle = this.circle;
      var point = circle.point,
        color = circle.color,
        scale = circle.scale,
        radius = circle.radius;
      ctx.save();
      ctx.fillStyle = color;
      ctx.translate(point.x, point.y);
      ctx.scale(scale, scale);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    drawText: function () {
      var ctx = this.tree.ctx,
        heart = this.heart;
      var point = heart.point,
        color = heart.color,
        scale = heart.scale;
      var text = this.hint;
      ctx.save();
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.translate(point.x, point.y);
      ctx.scale(scale, scale);
      ctx.scale(0.75, 0.75);
      ctx.font = "12px 微软雅黑,Verdana";
      var width = ctx.measureText(text).width; // 下划线长度随文案自适应，盖住整行字
      ctx.beginPath();
      ctx.moveTo(0, 0); // 从心形中心引出小尾巴
      ctx.lineTo(20, 20);
      ctx.lineTo(23 + width + 6, 20); // 水平线覆盖到文字末尾
      ctx.stroke();

      ctx.fillText(text, 23, 10);
      ctx.restore();
    },
    clear: function () {
      var ctx = this.tree.ctx,
        circle = this.circle;
      var point = circle.point;
      // 心形 + “点我发芽”标签向右伸出较远（下划线随文案自适应宽度），
      // 擦除区域要足够大，避免缩小/下落时残留半个字母和线尾
      var margin = this.clearMargin;
      ctx.clearRect(point.x - margin, point.y - margin, 4 * margin, 4 * margin);
    },
    hover: function (x, y) {
      // 先做包围盒粗筛，避免在 mousemove 高频下逐像素读取
      var point = this.circle.point;
      var range = this.hoverRange;
      if (x < point.x - range || x > point.x + range || y < point.y - range || y > point.y + range) {
        return false;
      }
      // 像素回读前把坐标钳制到画布内：极端情况下 getImageData 收到越界
      // 坐标时部分浏览器会抛 IndexSizeError，钳制后只可能读到透明像素
      var ctx = this.tree.ctx;
      var cx = Math.max(0, Math.min(this.tree.width - 1, x));
      var cy = Math.max(0, Math.min(this.tree.height - 1, y));
      var pixel = ctx.getImageData(cx, cy, 1, 1);
      // 不要求 alpha===255：心形被缩得很小或贴在画布边缘时，可见部分几乎全是
      // 抗锯齿半透明像素，严格相等会点不中；任何非透明像素即视为命中
      return pixel.data[3] > 0;
    },
  };

  /* ===== 地面（种子下落时逐帧铺开的土层） ===== */
  var Footer = function (tree, width, height, speed) {
    this.tree = tree;
    this.point = new Point(tree.seed.heart.point.x, tree.height - height / 2);
    this.width = width > 0 ? width : tree.width;
    this.height = height > 0 ? height : 5;
    // 速度必须 >0：0 或负值会让地面永远不生长（length 不增甚至倒退）
    this.speed = speed > 0 ? speed : 2;
    this.length = 0;
  };
  Footer.prototype = {
    draw: function () {
      var ctx = this.tree.ctx,
        point = this.point;
      var len = this.length / 2;

      ctx.save();
      ctx.strokeStyle = this.tree.ink || "rgb(35, 31, 32)";
      ctx.lineWidth = this.height;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.translate(point.x, point.y);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(len, 0);
      ctx.lineTo(-len, 0);
      ctx.stroke();
      ctx.restore();

      if (this.length < this.width) {
        this.length += this.speed;
      }
    },
  };

  /* ===== 树：统筹种子、地面、树枝与花瓣的容器 ===== */
  var Tree = function (canvas, width, height, opt) {
    this.canvas = canvas;
    // willReadFrequently：hover 需频繁 getImageData 像素回读，显式声明以消除 Chrome 警告并提速
    this.ctx = canvas.getContext("2d", { willReadFrequently: true });
    this.width = width;
    this.height = height;
    this.opt = opt || {};

    this.record = {};

    // 整树平移参数（move 动画用）
    var mv = this.opt.move || {};
    this.moveSpeed = mv.speed > 0 ? mv.speed : 10;
    // 衰减系数必须落在 (0,1)，否则速度不衰减或反向
    this.moveFriction = mv.friction > 0 && mv.friction < 1 ? mv.friction : 0.95;
    this.moveMinSpeed = mv.minSpeed > 0 ? mv.minSpeed : 2;

    // 花瓣飘落补充策略
    var pf = this.opt.petalFall || {};
    this.petalKeepAlive = pf.keepAlive >= 0 ? Math.floor(pf.keepAlive) : 3;
    var rMin = Math.floor(pf.recycle && pf.recycle.min > 0 ? pf.recycle.min : 1);
    var rMax = Math.floor(pf.recycle && pf.recycle.max > 0 ? pf.recycle.max : 2);
    if (rMin > rMax) {
      var tmp = rMin;
      rMin = rMax;
      rMax = tmp;
    }
    this.petalRecycle = { min: rMin, max: rMax };

    // 花瓣心形半径与采样尝试上限
    this.heartRadius = this.opt.heartRadius > 0 ? this.opt.heartRadius : 240;
    this.bloomTries = this.opt.bloom && this.opt.bloom.tries > 0 ? this.opt.bloom.tries : 800;

    // 通用墨色（树枝 / 地面）
    this.ink = typeof this.opt.inkColor === "string" && this.opt.inkColor ? this.opt.inkColor : "rgb(35, 31, 32)";

    this.initSeed();
    this.initFooter();
    this.initBranch();
    this.initBloom();
  };
  Tree.prototype = {
    initSeed: function () {
      var seed = this.opt.seed || {};
      // 配置已由 config.js 清洗，这里对“单独使用 love.js”的场景再兜底：
      // 坐标必须落在画布内且为有限数，否则种子会画到 NaN 位置（静默消失）
      var x = isFinite(seed.x) ? Math.max(0, Math.min(this.width, seed.x)) : this.width / 2;
      var y = isFinite(seed.y) ? Math.max(0, Math.min(this.height, seed.y)) : this.height / 2;
      var point = new Point(x, y);
      var color = typeof seed.color === "string" && seed.color ? seed.color : "#FF0000";
      var scale = seed.scale > 0 ? seed.scale : 1;

      this.seed = new Seed(
        this,
        point,
        scale,
        color,
        this.opt.seedHint,
        this.opt.seedClearMargin,
        this.opt.hoverRange
      );
    },

    initFooter: function () {
      var footer = this.opt.footer || {};
      var width = footer.width > 0 ? footer.width : this.width;
      var height = footer.height > 0 ? footer.height : 5;
      var speed = footer.speed > 0 ? footer.speed : 2;
      this.footer = new Footer(this, width, height, speed);
    },

    initBranch: function () {
      var branchs = Array.isArray(this.opt.branch) ? this.opt.branch : [];
      this.branchs = [];
      this.addBranchs(branchs);
    },

    initBloom: function () {
      var bloom = this.opt.bloom || {};
      var cache = [],
        num = bloom.num >= 0 ? Math.floor(bloom.num) : 500,
        width = bloom.width > 0 ? bloom.width : this.width,
        height = bloom.height > 0 ? bloom.height : this.height,
        figure = this.seed.heart.figure;
      var r = this.heartRadius;
      for (var i = 0; i < num; i++) {
        cache.push(this.createBloom(width, height, r, figure));
      }
      this.blooms = [];
      this.bloomsCache = cache;
    },

    toDataURL: function (type) {
      return this.canvas.toDataURL(type);
    },

    draw: function (k) {
      var s = this,
        ctx = s.ctx;
      var rec = s.record[k];
      if (!rec) {
        return;
      }
      var point = rec.point,
        image = rec.image;

      ctx.save();
      ctx.putImageData(image, point.x, point.y);
      ctx.restore();
    },

    addBranch: function (branch) {
      this.branchs.push(branch);
    },

    addBranchs: function (branchs) {
      var s = this,
        b,
        p1,
        p2,
        p3,
        r,
        l,
        c;
      for (var i = 0; i < branchs.length; i++) {
        b = branchs[i];
        p1 = new Point(b[0], b[1]);
        p2 = new Point(b[2], b[3]);
        p3 = new Point(b[4], b[5]);
        r = b[6];
        l = b[7];
        c = b[8];
        s.addBranch(new Branch(s, p1, p2, p3, r, l, c));
      }
    },

    removeBranch: function (branch) {
      var branchs = this.branchs;
      for (var i = 0; i < branchs.length; i++) {
        if (branchs[i] === branch) {
          branchs.splice(i, 1);
        }
      }
    },

    canGrow: function () {
      return !!this.branchs.length;
    },
    grow: function () {
      var branchs = this.branchs;
      for (var i = 0; i < branchs.length; i++) {
        var branch = branchs[i];
        if (branch) {
          branch.grow();
        }
      }
    },

    addBloom: function (bloom) {
      this.blooms.push(bloom);
    },

    removeBloom: function (bloom) {
      var blooms = this.blooms;
      for (var i = 0; i < blooms.length; i++) {
        if (blooms[i] === bloom) {
          blooms.splice(i, 1);
        }
      }
    },

    createBloom: function (
      width,
      height,
      radius,
      figure,
      color,
      alpha,
      angle,
      scale,
      place,
      speed
    ) {
      var x, y, tries = 0;
      // 采样上限：分布区域过小或心形半径过大时 inheart 命中率极低，
      // 旧版 while(true) 会死循环卡死页面；超限后退化到区域中心，保证返回花瓣
      while (tries++ < this.bloomTries) {
        x = random(20, width - 20);
        y = random(20, height - 20);
        if (inheart(x - width / 2, height - (height - 40) / 2 - y, radius)) {
          return new Bloom(this, new Point(x, y), figure, color, alpha, angle, scale, place, speed);
        }
      }
      return new Bloom(
        this,
        new Point(width / 2, height / 2),
        figure,
        color,
        alpha,
        angle,
        scale,
        place,
        speed
      );
    },

    canFlower: function () {
      return !!this.blooms.length;
    },
    flower: function (num) {
      var s = this,
        blooms = s.bloomsCache.splice(0, num);
      for (var i = 0; i < blooms.length; i++) {
        s.addBloom(blooms[i]);
      }
      blooms = s.blooms;
      // 倒序遍历：flower 过程中可能移除自身，倒序可避免跳过元素
      for (var j = blooms.length - 1; j >= 0; j--) {
        blooms[j].flower();
      }
    },

    snapshot: function (k, x, y, width, height) {
      var ctx = this.ctx;
      var image = ctx.getImageData(x, y, width, height);
      this.record[k] = {
        image: image,
        point: new Point(x, y),
        width: width,
        height: height,
      };
    },
    move: function (k, x, y) {
      var s = this,
        ctx = s.ctx;
      var rec = s.record[k || "move"];
      // 防御：未先调用 snapshot 就 move 时直接结束平移（返回 false 让调用方跳出循环）
      if (!rec) return false;
      var point = rec.point,
        image = rec.image,
        speed = rec.speed || s.moveSpeed,
        width = rec.width,
        height = rec.height;

      var i = point.x + speed < x ? point.x + speed : x;
      var j = point.y + speed < y ? point.y + speed : y;

      ctx.save();
      ctx.clearRect(point.x, point.y, width, height);
      ctx.putImageData(image, i, j);
      ctx.restore();

      rec.point = new Point(i, j);
      rec.speed = speed * s.moveFriction;

      if (rec.speed < s.moveMinSpeed) {
        rec.speed = s.moveMinSpeed;
      }
      return i < x || j < y;
    },

    jump: function () {
      var s = this,
        blooms = s.blooms;
      // 倒序遍历：jump 中可能移除自身
      for (var i = blooms.length - 1; i >= 0; i--) {
        blooms[i].jump();
      }
      if (blooms.length < s.petalKeepAlive) {
        var bloom = this.opt.bloom || {},
          width = bloom.width > 0 ? bloom.width : this.width,
          height = bloom.height > 0 ? bloom.height : this.height,
          figure = this.seed.heart.figure;
        var r = this.heartRadius;
        var n = random(s.petalRecycle.min, s.petalRecycle.max);
        for (var j = 0; j < n; j++) {
          blooms.push(
            this.createBloom(
              width / 2 + width,
              height,
              r,
              figure,
              null,
              1,
              null,
              1,
              new Point(random(-100, 600), 720),
              random(200, 300)
            )
          );
        }
      }
    },
  };

  /* ===== 树枝：沿贝塞尔曲线逐帧生长的节点 ===== */
  var Branch = function (tree, point1, point2, point3, radius, length, branchs) {
    this.tree = tree;
    this.point1 = point1;
    this.point2 = point2;
    this.point3 = point3;
    // ctx.arc 半径必须 >0（负半径会抛 IndexSizeError）；长度至少 2，
    // 否则生长参数 t=1/(length-1) 为 Infinity/负数，生长逻辑失去意义
    this.radius = radius > 0 ? radius : 1;
    this.length = length >= 2 ? length : 100;
    this.len = 0;
    this.t = 1 / (this.length - 1);
    this.branchs = branchs || [];
  };

  Branch.prototype = {
    grow: function () {
      var s = this,
        p;
      if (s.len <= s.length) {
        p = bezier([s.point1, s.point2, s.point3], s.len * s.t);
        s.draw(p);
        s.len += 1;
        s.radius *= 0.97;
      } else {
        s.tree.removeBranch(s);
        s.tree.addBranchs(s.branchs);
      }
    },
    draw: function (p) {
      var s = this;
      var ctx = s.tree.ctx;
      var ink = s.tree.ink || "rgb(35, 31, 32)";
      ctx.save();
      ctx.beginPath();
      ctx.fillStyle = ink;
      ctx.shadowColor = ink;
      ctx.shadowBlur = 2;
      ctx.moveTo(p.x, p.y);
      ctx.arc(p.x, p.y, s.radius, 0, 2 * Math.PI);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
  };

  /* ===== 花瓣：开花期绽放、飘落期持续下落 ===== */
  var Bloom = function (tree, point, figure, color, alpha, angle, scale, place, speed) {
    this.tree = tree;
    this.point = point;
    this.color = color || "rgb(255," + random(0, 255) + "," + random(0, 255) + ")";
    this.alpha = alpha > 0 ? alpha : random(0.3, 1);
    this.angle = angle || random(0, 360);
    this.scale = scale > 0 ? scale : 0.1;
    this.place = place;
    this.speed = speed;

    this.figure = figure;
  };
  Bloom.prototype = {
    flower: function () {
      var s = this;
      s.draw();
      s.scale += 0.1;
      if (s.scale > 1) {
        s.tree.removeBloom(s);
      }
    },
    draw: function () {
      var s = this,
        ctx = s.tree.ctx,
        figure = s.figure;

      ctx.save();
      ctx.fillStyle = s.color;
      ctx.globalAlpha = s.alpha;
      ctx.translate(s.point.x, s.point.y);
      ctx.scale(s.scale, s.scale);
      ctx.rotate(s.angle);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      for (var i = 0; i < figure.length; i++) {
        var p = figure.get(i);
        ctx.lineTo(p.x, -p.y);
      }
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },
    jump: function () {
      var s = this,
        height = s.tree.height;

      // 防御：飘落目标/速度缺失（理论上只有开花期缓存花瓣会这样），
      // 或速度已衰减到 0（继续运动会产生 NaN 坐标且永不移除）→ 直接回收
      if (!s.place || !(s.speed > 0) || s.point.x < -20 || s.point.y > height + 20) {
        s.tree.removeBloom(s);
      } else {
        s.draw();
        s.point = s.place.sub(s.point).div(s.speed).add(s.point);
        s.angle += 0.05;
        s.speed -= 1;
      }
    },
  };

  // 仅暴露页面主控（main.js）需要的构造器
  window.Tree = Tree;
})(window);
