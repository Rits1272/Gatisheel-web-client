import React, { useEffect } from 'react';
import clsx from 'clsx';
import { makeStyles } from '@material-ui/core/styles';
import CssBaseline from '@material-ui/core/CssBaseline';
import Drawer from '@material-ui/core/Drawer';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import List from '@material-ui/core/List';
import Typography from '@material-ui/core/Typography';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import { useHistory } from 'react-router-dom';

import firebase from '../Firebase';

const drawerWidth = 240;

const useStyles = makeStyles((theme) => ({
  root: {
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: {
    zIndex: theme.zIndex.drawer + 1,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    background: 'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
    width: '100%',
  },
  appBarShift: {
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: {
    marginRight: 10,
  },
  menuButtonHidden: {
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: {
    position: 'relative',
    whiteSpace: 'nowrap',
    width: drawerWidth,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
    height: '100%'
  },
  drawerPaperClose: {
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    [theme.breakpoints.up('sm')]: {
      width: '0px',
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
    height: '100%',
    overflow: 'auto',
  },
  container: {
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
  },
  paper: {
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
  },
  fixedHeight: {
    height: 240,
  },
  listItem: {
    padding: 20,
    fontSize: 15,
    cursor: 'pointer'
  }
}));

export default function NavBar() {
  const classes = useStyles();
  const [open, setOpen] = React.useState(true);
  const [user, setUser] = React.useState();
  const history = useHistory();

  const handleDrawerOpen = () => {
    setOpen(true);
  };

  const handleDrawerClose = () => {
    setOpen(false);
  };

  const navigate = (type) => {
    const path = '/' + type;
    history.push(path);
    return;
  }

  const logoutUser = (e) => {
    e.preventDefault();
    firebase.auth().signOut();
    history.push("/login");
  }

  useEffect(() => {
    firebase.auth().onAuthStateChanged(function(user) {
      setUser(user);
    })
  }, []);

  return (
    <div className={classes.root}>
      <CssBaseline />
      <AppBar position="absolute" className={clsx(classes.appBar, open && classes.appBarShift)}>
        <Toolbar className={classes.toolbar}>
          {user && 
          <IconButton
            edge="start"
            color="inherit"
            aria-label="open drawer"
            onClick={handleDrawerOpen}
            className={clsx(classes.menuButton, open && classes.menuButtonHidden)}
          >
            <MenuIcon />
          </IconButton>
          }
          <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
            Documentive
          </Typography>
          <IconButton color="inherit">
            {user ? <Typography component="h1" variant="h6" color="inherit" onClick = {(e) => logoutUser(e)}>
              Logout
          </Typography> :
              <Typography component="h1" variant="h6" color="inherit">
                Login
          </Typography>}
          </IconButton>
        </Toolbar>
      </AppBar>
      <Drawer
        variant="permanent"
        classes={{
          paper: clsx(classes.drawerPaper, !open && classes.drawerPaperClose),
        }}
        open={open}
      >
        <div className={classes.toolbarIcon}>
          <IconButton onClick={handleDrawerClose}>
            <ChevronLeftIcon />
          </IconButton>
        </div>
        <Divider />
        <List className={classes.listItem} onClick={() => navigate('home')}>Today</List>
        <Divider />
        <List className={classes.listItem} onClick={() => navigate('register')}>Add New Role</List>
        <Divider />
        <List className={classes.listItem} onClick={() => navigate('AddDrawing')}>Add Drawings</List>
        <Divider />
        <List className={classes.listItem} onClick={() => navigate('report')}>Monthly Report</List>
        <Divider />
        <List className={classes.listItem} onClick={() => navigate('employees')}>Employees</List>
        <Divider />
      </Drawer>
    </div>
  );
}

