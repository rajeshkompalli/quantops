import os
from dotenv import load_dotenv
from alpaca.data.historical import StockHistoricalDataClient
from alpaca.data.requests import StockBarsRequest
from alpaca.data.timeframe import TimeFrame


load_dotenv()

api_key = os.getenv("ALPACA_API_KEY")
secret_key = os.getenv("ALPACA_SECRET_KEY")

def get_historical_bars(symbol, start_date, end_date=None):

    client = StockHistoricalDataClient(api_key, secret_key)

    request_params = {
        'symbol_or_symbols': symbol,
        'timeframe': TimeFrame.Day,
        'start': start_date,
    }
    if end_date is not None:
        request_params['end'] = end_date

    request = StockBarsRequest(**request_params)

    bars = client.get_stock_bars(request)
    df = bars.df.reset_index()

    return df