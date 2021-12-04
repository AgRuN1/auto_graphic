class Graphic{
    constructor(canvas){
        this.context = canvas.getContext(`2d`);
        this.canvas = canvas;
        this.canvas.addEventListener('click', this.click_handle.bind(this));
    }
    click_handle(event){
        let rect = this.canvas.getBoundingClientRect();
        let x = event.clientX - rect.left;
        let y = event.clientY - rect.top;
        for(let obj of this.points){
            let x1 = obj.x + this.radius, x2 = obj.x - this.radius;
            let y1 = obj.y + this.radius, y2 = obj.y - this.radius;
            if(x > x2 && x < x1 && y > y2 && y < y1){
                let auto = {};
                Object.assign(auto, this.data[obj.index]);
                auto.price = this.price_format(auto.price);
                this.callback(auto);
            }
        }
    }
    setClickCallback(callback){
        this.callback = callback;
    }
    init(data){
        this.models = new Map();
        this.data = data
        this.min_price = 0;
        this.max_price = 0;
        for(let elem of data){
            if(!this.models.has(elem.model)){
                this.models.set(elem.model, this.models.size);
            }
            if(this.min_price == 0 || this.min_price > elem.price){
                this.min_price = elem.price;
            }
            if(this.max_price == 0 || this.max_price < elem.price){
                this.max_price = elem.price;
            }
        }
        let precision = 100000
        this.min_price = Math.floor(this.min_price / precision) * precision;
        this.max_price = Math.ceil(this.max_price / precision) * precision;
        this.precision = precision;
        this.xOffset = 80;
        this.yOffset = 50;
        this.volume = (this.canvas.width - this.xOffset) * (this.canvas.height - 2 * this.yOffset);
        this.radius = Math.min(8, Math.sqrt(this.volume / this.models.size / 2));
        this.mid_width = (this.canvas.width - this.xOffset) / this.models.size;
    }
    price_format(price){
        price = price.toString()
        let res = [];
        let counter = -3;
        res.unshift(price.slice(counter));
        while(price.slice(counter - 3, counter)){
            res.unshift(price.slice(counter - 3, counter));
            counter -= 3;
        }
        return res.join(' ');
    }
    draw_models(){
        this.context.font = "italic 15pt Arial";
        let mid_width = this.mid_width;
        for(let pair of this.models){
            let offset = mid_width / 2 - pair[0].length * 5;
            this.context.fillText(pair[0], this.xOffset + pair[1] * mid_width + offset, 30);
            this.context.beginPath();
            this.context.moveTo(this.xOffset + pair[1] * mid_width, 0);
            this.context.lineTo(this.xOffset + pair[1] * mid_width, this.canvas.height);
            this.context.stroke();
        }
    }
    draw_prices(){
        this.context.font = "italic 10pt Arial";
        let count = (this.max_price - this.min_price) / this.precision;
        let height = (this.canvas.height - this.yOffset * 2) / count;
        for(let i = 0; i <= count; ++i){
            let offset = height * i + this.yOffset;
            let current_price = this.min_price + i * this.precision
            this.context.fillText(this.price_format(current_price), 10, offset);
            this.context.beginPath();
            this.context.moveTo(this.xOffset, offset - 4);
            this.context.lineTo(this.canvas.width, offset - 4);
            this.context.stroke();
        }
    }
    draw(){
        this.draw_models()
        this.draw_prices()
        let price_line = this.max_price - this.min_price
        let y_line = this.canvas.height - this.yOffset * 2;
        let divider = price_line / y_line;
        let mid_width = this.mid_width;
        let color = '#777777';
        this.context.fillStyle = color;
        this.context.strokeColor = color;
        this.points = [];
        for(let i = 0; i < this.data.length; ++i){
            let auto = this.data[i];
            let x = this.xOffset + this.models.get(auto.model) * mid_width + mid_width / 2;
            let y = (auto.price - this.min_price) / divider + this.yOffset;
            this.points.push({x: x, y: y, index: i});
            this.context.beginPath();
            this.context.arc(x, y, this.radius, 0, 2 * Math.PI, false);
            this.context.fill();
        }
    }
}