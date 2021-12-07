from manager import DataManager

def main():
    manager = DataManager()
    columns = [
            'Бренд', 'Модель', 'Комплектация', 'Привод', 'Год',
            'Розничная Цена', 'Скидка', 'Финальная Цена', 'Утилизация',
            'Обычный Трейд-ин', 'Специальный Трейд-ин', 'Трейд-ин для лояльных клиентов',
            'Прямая скидка', 'Комментарий'
        ]
    sizes = [
        15, 15, 50, 20, 10,
        15, 10, 15, 15,
        15, 15, 15,
        15, 30
    ]
    manager.write_columns(columns, sizes)
    data = manager.load_data('data.json')
    manager.write_data(data)
    manager.save_data('data.xlsx')

if __name__ == '__main__':
    main()