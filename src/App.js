import React from "react";
import { Switch, Route, withRouter, Redirect } from "react-router-dom";
import ManageRiceSeed from "./ManageRiceSeed";
import Home from "./Home";
import NavigationTabs from "./NavigationTabs";
import ManageRiceSeedStages from "./ManageRiceSeedStages";
import ManageRiceSeedIngredients from "./ManageRiceSeedIngredients";
import ManageRiceSeedLocations from "./ManageRiceSeedLocations";
import ManageRiceSeedSoils from "./ManageRiceSeedSoil";
import ManageRiceSeedWeathers from "./ManageRiceSeedWeathers";

function App() {
  return (
    <>
      <NavigationTabs />
      <Switch>
        <Route path="/manage-rice-seed" component={ManageRiceSeed} />
        <Route
          path="/manage-rice-seed-stages"
          component={ManageRiceSeedStages}
        />
        <Route
          path="/manage-rice-seed-ingredients"
          component={ManageRiceSeedIngredients}
        />
        <Route
          path="/manage-rice-seed-locations"
          component={ManageRiceSeedLocations}
        />
        <Route path="/manage-rice-seed-soils" component={ManageRiceSeedSoils} />
        <Route
          path="/manage-rice-seed-weathers"
          component={ManageRiceSeedWeathers}
        />
        <Route path="/" exact component={Home} />
        <Redirect to="/" />
      </Switch>
    </>
  );
}

export default withRouter(App);
