import React from 'react';
import {
  AuthenticatedPageRoute,
  PageWrap,
} from '@edx/frontend-platform/react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { ProfilePage, NotFoundPage } from '../profile';

const AppRoutes = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Routes>
      {/*
        Key ProfilePage by pathname so it re-mounts (and re-fetches in its
        componentDidMount) on every path change. ProfilePage fetches only on
        mount, and react-router keeps the same instance across these sibling
        routes -- so navigating to/from /preview (or between usernames) would
        otherwise reuse the stale fetch and the page wouldn't fully re-render.
      */}
      <Route path="/u/:username" element={<AuthenticatedPageRoute><ProfilePage key={location.pathname} navigate={navigate} /></AuthenticatedPageRoute>} />
      <Route path="/u/:username/preview" element={<AuthenticatedPageRoute><ProfilePage key={location.pathname} navigate={navigate} isPreview /></AuthenticatedPageRoute>} />
      <Route path="/notfound" element={<PageWrap><NotFoundPage /></PageWrap>} />
      <Route path="*" element={<PageWrap><NotFoundPage /></PageWrap>} />
    </Routes>
  );
};

export default AppRoutes;
