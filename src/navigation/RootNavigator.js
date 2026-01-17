import React, { useState } from 'react';
import AuthStack from './AuthStack';
import AppStack from './AppStack';

export default function RootNavigator() {
  const [isAuthenticated] = useState(false);

  return isAuthenticated ? <AppStack /> : <AuthStack />;
}
