import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import './Custom.css';
import './App.css';
import { pink } from '@mui/material/colors';
import { alpha, styled } from '@mui/material/styles';
import Swal from 'sweetalert2';
import mqtt from 'mqtt';

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
  const handleMqttMessage = (message) => {
    try {
      const data = JSON.parse(message.toString());
      console.log(data)
      if ('people' in data) {
        setStatus(data);
      }
      if ('doorOpen' in data) {
        setStatus(data);
      }
    } catch (error) {
      console.error('Error parsing MQTT message:', error);
    }
  };
  useEffect(() => {
    fetchStatus();
  
    // create MQTT client and subscribe to topic "update"
    const client = mqtt.connect('ws://test.mosquitto.org:8080/mqtt');
    client.on('connect', function () {
      console.log('Connected to MQTT Broker!');
      client.subscribe('update');
    });
    client.on('message', function (topic, message) {
      // const data = JSON.parse(message.toString()); // parse JSON string to object
      handleMqttMessage(message);
    });
  
    return () => {
      client.end(); // disconnect MQTT client on unmount
    };
  }, []);

  
  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/status');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง',
      });
    }
  };
  

  const toggleLock = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/toggle', { method: 'POST' });
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
  
      if (status && !status.doorOpen) {
        setStatus(data);
        const client = mqtt.connect('ws://test.mosquitto.org:8080/mqtt');
        client.on('connect', function () {
          console.log('Connected to MQTT Broker!');
          const lock_status = data.locked ? 'LOCK' : 'UNLOCK';
          client.publish('456', JSON.stringify({ lock: lock_status }));
        });
        client.on('error', function (error) {
          console.error('Error:', error);
        });
        client.end();
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: 'ไม่สามารถล็อคประตูได้เนื่องจากประตูเปิดอยู่',
        });
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง',
      });
    }
  };
  
  

  return (
    <Container className="App ">
      <Row className="align-items-center ">
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
                  inputProps={{ 'aria-label': 'Toggle Lock' }}
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
