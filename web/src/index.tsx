import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Splash } from './components/splash';
import { Main } from './components/main';
import reportWebVitals from './reportWebVitals';
import { Route, BrowserRouter as Router, Redirect, BrowserRouterProps } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.css';
import { iResponseObject } from './functions/interfaces';
import { ResponseObject } from './functions/constructors'
import { Styles } from './functions/constants';

const AppContainer: React.FunctionComponent<{}> = function():React.ReactElement {
    interface PrivateRouteProps extends BrowserRouterProps {
        component: React.ReactType;
        path: string;
        dataObject: iResponseObject;
        updateFunction: Function;
    };

    let initialObject: iResponseObject = new ResponseObject();

    const [responseObject, updateObject] = useState(initialObject);

    //useEffect(() => console.log("Effect", responseObject), [responseObject]);

    const updateHandler: Function = function (newObject: iResponseObject|null = null): void {
        updateObject(Object.assign(new ResponseObject, newObject));
        console.log("Results", newObject);
    };

    const PrivateRoute: React.FunctionComponent<PrivateRouteProps> = (props: PrivateRouteProps) => {
        const { component: Component, ...rest } = props;
        return (
            <Route {...rest} render={() => (
                props.dataObject.isAuthenticated
                    ? <Component {...rest} />
                    : <Redirect to='/' />
            )} />
        )
    };

    return (
        <React.StrictMode>
            <div style={Styles.sContainerFont}>
                <Router>
                    <Route exact path="/" render={() => (<Splash dataObject={responseObject} updateFunction={updateHandler} />)} />
                    <PrivateRoute path="/main" component={Main} dataObject={responseObject} updateFunction={updateHandler} />
                </Router>
            </div >
        </React.StrictMode>
    )
}

ReactDOM.render(
    <AppContainer/>, document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
