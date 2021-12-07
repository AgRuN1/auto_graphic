document.addEventListener("DOMContentLoaded", function(){
    fetch('./data.json')
    .then(response => response.json())
    .then(data => {
        const canvas = document.getElementById('field');
        let gr = new Graphic(canvas, {
            model_field: 'model',
            name_field: 'trim',
            price_field: 'final_price',
            first_price_field: 'first_price',
            text_color: '#222222',
            lines_color: '#AAAAAA',
            circles_color: '#555555',
            models_font: "normal bold 18px Arial",
            prices_font:"italic 12px Arial",
            circle_distance: 1,
            radius: 4,
            first_price_colors: {
                'AT': '#00B050',
                '4WD': '#FF0000'
            }
        });
        gr.init(data);
        gr.draw()
    });
});