class Graphic{
    constructor(canvas, options){
        this.context = canvas.getContext(`2d`);
        this.canvas = canvas;
        this.model_field = 'model';
        this.price_field = 'price';
        this.drive_field = 'drive';
        this.text_color = '#222222';
        this.lines_color = '#AAAAAA';
        this.circles_color = '#555555';
        this.first_drives = [
            {drive: 'FWD', color: '#00B050'},
            {drive: '4WD', color: '#FF0000'}
        ];
        this.radius = 8;
        Object.assign(this, options);
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
                Object.assign(auto, this.data[obj.model][obj.index]);
                auto.price = this.price_format(auto.price);
                this.callback(auto);
            }
        }
    }
    setClickCallback(callback){
        this.callback = callback;
    }
    init(data){
        this.data = {};
        this.min_price = 0;
        this.max_price = 0;
        for(let elem of data){
            if(!this.data[elem[this.model_field]]){
                this.data[elem[this.model_field]] = [];
            }
            this.data[elem[this.model_field]].push(elem);
            if(this.min_price == 0 || this.min_price > elem[this.price_field]){
                this.min_price = elem[this.price_field];
            }
            if(this.max_price == 0 || this.max_price < elem[this.price_field]){
                this.max_price = elem[this.price_field];
            }
        }
        for(let model in this.data){
            this.data[model].sort(this.price_compare.bind(this));
        }
        let precision = 100000
        this.min_price = Math.floor(this.min_price / precision) * precision;
        this.max_price = Math.ceil(this.max_price / precision) * precision;
        this.precision = precision;
        this.xOffset = 80;
        this.yOffset = 50;
        this.models = Object.keys(this.data);
        this.mid_width = (this.canvas.width - this.xOffset) / this.models.length;
    }
    price_compare(obj1, obj2){
        return obj1[this.price_field] - obj2[this.price_field];
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
    set_color(color){
        this.context.fillStyle = color;
        this.context.strokeStyle = color;
    }
    draw_models(){
        this.context.font = "italic 15pt Arial";
        let mid_width = this.mid_width;
        for(let i = 0; i < this.models.length; ++i){
            let model = this.models[i];
            let offset = mid_width / 2 - model.length * 5;
            this.set_color(this.text_color);
            this.context.fillText(model, this.xOffset + i * mid_width + offset, 30);
            this.context.beginPath();
            this.context.moveTo(this.xOffset + i * mid_width, 0);
            this.context.lineTo(this.xOffset + i * mid_width, this.canvas.height);
            this.set_color(this.lines_color);
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
            this.set_color(this.text_color);
            this.context.fillText(this.price_format(current_price), 10, offset);
            this.context.beginPath();
            this.context.moveTo(this.xOffset, offset - 4);
            this.context.lineTo(this.canvas.width, offset - 4);
            this.set_color(this.lines_color);
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
        let max_amount = Math.floor((mid_width - 10) / (this.radius + 2) / 2);
        this.points = [];
        for(let model_index = 0; model_index < this.models.length; ++model_index){
            const model = this.models[model_index];
            let counter = 0;
            let drives = {};
            for(let elem of this.first_drives){
                drives[elem.drive] = {color: elem.color, was: false};
            }
            for(let auto_index = 0; auto_index < this.data[model].length; ++auto_index){
                this.set_color(this.circles_color);
                let auto = this.data[model][auto_index];
                if(drives[auto[this.drive_field]].was == false){
                    drives[auto[this.drive_field]].was = true
                    this.set_color(drives[auto[this.drive_field]].color);
                }
                let offset = 2 * (this.radius + 2) * counter + this.radius + 5;
                let x = this.xOffset + model_index * mid_width + offset;
                let y = (auto[this.price_field] - this.min_price) / divider + this.yOffset;
                this.points.push({x: x, y: y, index: auto_index, model: model});
                this.context.beginPath();
                this.context.arc(x, y, this.radius, 0, 2 * Math.PI, false);
                this.context.fill();
                if(counter == max_amount - 1){
                    counter = 0;
                }else{
                    ++counter;
                }
            }
        }
    }
}