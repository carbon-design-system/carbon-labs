/**
 * @license
 *
 * Copyright IBM Corp. 2026
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { useState } from 'react';
import { Calendar } from '@carbon-labs/react-calendar';
import type { CalendarView } from '@carbon-labs/react-calendar';

function App() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<CalendarView>('month');

  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };

  const handleViewChange = (newView: CalendarView) => {
    setView(newView);
  };

  return (
    <div style={{ height: '100vh' }}>
      <Calendar
        initialDate={currentDate}
        onNavigate={handleNavigate}
        defaultView={view}
        views={['month', 'week', 'day', 'threeDays', 'workWeek']}
        onViewChange={handleViewChange}
        weekStartsOn={0}
        region="en-US"
        toolbar={true}
        stickyHeader={true}
        scrollToCurrentTime={true}
        className="calendar-custom"
      />
    </div>
  );
}

export default App;
