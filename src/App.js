import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import './Custom.css';
import { pink } from '@mui/material/colors';
import { alpha, styled } from '@mui/material/styles';

function App() {
  const [status, setStatus] = useState(null);
  const switchColor = status && status.locked ? "switch-locked" : "switch-unlocked";
  const PinkSwitch = styled(Switch)(({ theme }) => ({
    '& .MuiSwitch-switchBase.Mui-checked': {
      color: pink[600],
      '&:hover': {
        backgroundColor: alpha(pink[600], theme.palette.action.hoverOpacity),
      },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
      backgroundColor: pink[600],
    },
  }));
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    const response = await fetch('http://localhost:5000/api/status');
    const data = await response.json();
    setStatus(data);
  };

  const toggleLock = async () => {
    const response = await fetch('http://localhost:5000/api/toggle', { method: 'POST' });
    const data = await response.json();
    setStatus(data);
  };

  return (
    <Container className="App">
      <Row className="align-items-center">
        <Col className="custom-border">
          <h1 className="text-blue">Smart Home Security</h1>
          <p>Door lock status: <strong>{status && (status.locked ? 'Locked' : 'Unlocked')}</strong></p>
          <p>People count: <strong>{status && status.peopleCount}</strong></p>
          <p>Door sensor status: <strong>{status && (status.doorOpen ? 'Open' : 'Closed')}</strong></p>
        </Col>
        <Col className="custom-border">
          <Form>
            <FormControlLabel
              className={`${switchColor}`}
              control={
                <PinkSwitch className='h1'
                  checked={status && status.locked}
                  onChange={toggleLock}
                  color="primary"
                  inputProps={{ 'aria-label': 'Toggle Lock' } }
                  classes={{
                    track: `${switchColor}`,
                    switchBase: `${switchColor}`,
                  }}
                />
              }
              label="Toggle Lock"
            />
          </Form>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
