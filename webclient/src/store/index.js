import rootReducer from '../reducers';
import { createStore, applyMiddleware } from "redux";
import thunk from "redux-thunk";    
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage'

const persistConfig = {
    key: 'root',
    storage,
};
   
const persistedReducer = persistReducer(persistConfig, rootReducer)

const PersistorStore = () => {
    let store = createStore(persistedReducer, applyMiddleware(thunk))
    let persistor = persistStore(store)
    return { store, persistor }
};

export default PersistorStore;