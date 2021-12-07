class Graphic{
    constructor(canvas, options){
        this.model_field = 'model';
        this.name_field = 'name';
        this.price_field = 'price';
        this.first_price_field = 'first_price';
        this.text_color = '#222222';
        this.lines_color = '#AAAAAA';
        this.circles_color = '#555555';
        this.models_font = "italic 18px Arial";
        this.prices_font = "italic 12px Arial";
        this.circle_distance = 1;
        this.radius = 4;
        Object.assign(this, options);
        this.canvas = canvas;
        this.context = canvas.getContext(`2d`);
        this.show = false;
        let tooltip = document.createElement('div');
        tooltip.classList.add('tooltip');
        tooltip.classList.add('fade');
        document.body.appendChild(tooltip);
        this.tooltip = tooltip;
        this.canvas.addEventListener('mousemove', this.mouse_handle.bind(this));
    }
    mouse_handle(event){
        let x = event.offsetX;
        let y = event.offsetY;
        if(x <= this.xOffset || y <= this.yOffset || x >= this.canvas.width)
            return;
        let model_index = Math.floor((x - this.xOffset) / this.mid_width);
        let found = false;
        for(let obj of this.points[model_index]){
            let x1 = obj.x + this.radius, x2 = obj.x - this.radius;
            let y1 = obj.y + this.radius, y2 = obj.y - this.radius;
            if(x > x2 && x < x1 && y > y2 && y < y1){
                if(!this.show){
                    this.show = true;
                    let rect = this.canvas.getBoundingClientRect();
                    let data = {
                        x: obj.x,
                        y: obj.y,
                        top: rect.top,
                        left: rect.left 
                    };
                    this.show_tooltip(this.data[obj.model][obj.index], data);
                }
                found = true;
                break;
            }
        }
        if(!found && this.show){
            this.show = false;
            this.hide_tooltip();
        }
    }
    show_tooltip(auto, data){
        let auto_name = auto[this.name_field];
        let auto_price = this.price_format(auto[this.price_field]);
        let content = "<p>" + auto_name + "</p><p>" + auto_price + "&#8381;</p>";
        this.tooltip.innerHTML = content;
        this.tooltip.classList.remove('fade');
        let offsetX = 15;
        let baseX = data.left + data.x;
        let baseY = data.top + data.y;
        let x = baseX + offsetX;
        if(data.x + this.tooltip.offsetWidth + offsetX >= this.canvas.width){
            x = baseX - this.tooltip.offsetWidth - offsetX + 4;
            this.tooltip.classList.add('arrow-right');
        }else{
            this.tooltip.classList.add('arrow-left');
        }
        let y = baseY - this.tooltip.offsetHeight / 2;
        this.tooltip.style.setProperty('left', x + 'px');
        this.tooltip.style.setProperty('top', y + 'px');
    }
    hide_tooltip(){
        this.tooltip.innerHTML = '';
        this.tooltip.classList.add('fade');
        this.tooltip.classList.remove('arrow-left');
        this.tooltip.classList.remove('arrow-right');
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
        this.context.font = this.models_font;
        let mid_width = this.mid_width;
        for(let i = 0; i < this.models.length; ++i){
            let model = this.models[i];
            let offset = mid_width / 2 - model.length * 4;
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
        this.context.font = this.prices_font;
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
        let max_amount = Math.floor((mid_width - 10) / (this.radius + this.circle_distance) / 2);
        this.points = {};
        for(let model_index = 0; model_index < this.models.length; ++model_index){
            const model = this.models[model_index];
            let counter = 0;
            for(let auto_index = 0; auto_index < this.data[model].length; ++auto_index){
                this.set_color(this.circles_color);
                let auto = this.data[model][auto_index];
                if(auto[this.first_price_field]){
                    let color = this.first_price_colors[auto[this.first_price_field]];
                    color = color || this.circles_color;
                    this.set_color(color);
                }
                let offset = 2 * (this.radius + this.circle_distance) * counter + this.radius + 5;
                let x = this.xOffset + model_index * mid_width + offset;
                let price = auto[this.price_field];
                let y = (price - this.min_price) / divider + this.yOffset - this.radius;
                if(!this.points[model_index]){
                    this.points[model_index] = [];
                }
                this.points[model_index].push({x: x, y: y, index: auto_index, model: model});
                this.context.beginPath();
                this.context.arc(x, y, this.radius, 0, 2 * Math.PI);
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