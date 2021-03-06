import React, { useState, useEffect, useDebugValue } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import NavBar from '../utils/NavBar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import characterSix from '../utils/Images/characterSix.png';
import Container from '@material-ui/core/Container';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import InputLabel from '@material-ui/core/InputLabel';
import Fab from '@material-ui/core/Fab';
import AddIcon from '@material-ui/icons/Add';
import firebase from '../Firebase';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import Alert from '@material-ui/lab/Alert';
import DialogTitle from '@material-ui/core/DialogTitle';
import Grid from '@material-ui/core/Grid';
import Link from '@material-ui/core/Link';
import { Redirect } from 'react-router-dom';

import { connect } from 'react-redux';

const useStyles = makeStyles({
    formControl: {
        margin: 30,
        minWidth: 120,
    },
    inputDiv: {
        marginTop: 60,
        textAlign: 'center',
        width: "100%",
    },
    form: {
        width: '100%', // Fix IE 11 issue.

    },
    paper: {
        marginTop: 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    formControl: {
        margin: 30,
        minWidth: 120,
    },
    submit: {
        marginTop: 30,
        padding: 7,
        fontSize: 17,
    },
    root: {
        '& > *': {
            margin: 5,
        },
    },
    extendedIcon: {
        marginRight: 5,
    },
    addBtn: {
        margin: 0,
        top: 'auto',
        right: 20,
        bottom: 20,
        left: 'auto',
        position: 'fixed',
    }
});

function Inventory(props) {
    const classes = useStyles();
    const [data, setData] = useState();
    const [parameters, setParameters] = useState({});
    const [material, setMaterial] = useState([]);
    const [activeMaterial, setActiveMaterial] = useState("");
    const [open, setOpen] = useState(false);
    const [newMaterial, setNewMaterial] = useState([{ parameter: '', value: 'null' }]);
    const [name, setName] = useState("");
    const [msg, setMsg] = useState("");
    const [type, setType] = useState();
    const { isAuthenticated, role } = props;
    const [s, setS] = useState(0); // workaround to rerender the update material state

    const [umaterial, setUmaterial] = useState([{ parameter: '', value: 'null' }]);

    const [updateOpen, setUpdateOpen] = useState(false);

    const handleUpdateOpen = () => {
        setUpdateOpen(true);
    }

    const handleUpdateClose = () => {
        setUpdateOpen(false);
    }

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const handleAddFields = () => {
        const values = [...newMaterial];
        values.push({ parameter: '', value: 'null' });
        setNewMaterial(values);
    }

    const handleUpdateAddFields = () => {
        const values = [...umaterial];
        values.push({parameter: '', value: 'null'});
        setUmaterial(values);
    }

    const handleUpdateRemoveField = (index) => {
        const values = [...umaterial];
        if(values.length == 1) return;
        values.splice(index, 1);
        setUmaterial(values);
    }

    const handleRemoveFields = index => {
        const values = [...newMaterial];
        if (values.length === 1) {
            return;
        }
        values.splice(index, 1);
        setNewMaterial(values);
    }

    const handleInputChange = (index, event) => {
        const values = [...newMaterial];
        values[index]['parameter'] = event.target.value;
        setNewMaterial(values);
    }

    const handleUpdateInputChange = (index, event) => {
        const values = umaterial;
        values[index]['parameter'] = event.target.value;
        setUmaterial(values);
    }

    const saveUpdateMaterial = () => {
        const values = parameters
        Object.keys(umaterial).map(key => {
            if(umaterial[key] !== ""){
                values[activeMaterial].push(umaterial[key]['parameter']);
            }
        })
        setParameters(values)
        const obj = {};
        parameters[activeMaterial].map(item => {
            if(item !== ""){
                obj[item] = data[activeMaterial][item] || "null";
            }
        })
        try{
            const ref = firebase.database().ref();
            ref.child(`inventory/${activeMaterial}`).set(obj);
            setMsg("Parameters updated succesfully");
            setType("success");
        }
        catch(err){
            setMsg("Something went wrong!");
            setType("error");
        }
        const init = [{ parameter: '', value: 'null' }];
        setUmaterial(init);
    }

    const saveParameters = () => {
        if (name === "") {
            setMsg("Please enter valid material name");
            setType("error");
            return;
        }
        const obj = {};
        newMaterial.map((item, index) => {
            obj[item.parameter] = item.value;
        });
        try {
            const ref = firebase.database().ref();
            ref.child(`inventory/${name}`).set(obj);
            setMsg("Material added to inventory successfully!")
            setType("success");
        }
        catch (err) {
            setType("error");
            setMsg("Something went wrong. Please check if all the details are valid!")
        }
        finally {
            handleClose();
        }
    }

    const saveDetails = (e) => {
        e.preventDefault();
        const ref = firebase.database().ref();
        const obj = data[activeMaterial];
        try {
            ref.child(`inventory/${activeMaterial}`).set(obj);
            setMsg("Data values updated sucessfully!")
        }
        catch (err) {
            setMsg("Unable to update data values!")
        }
        return;
    }

    const updateParameter = (e, param) => {
        const tmp = data;
        tmp[activeMaterial][param] = e.target.value;
        setData(tmp);
        setS(Math.random(100000));
    }

    const disappear = () => {
        if (msg !== "") {
            setTimeout(() => setMsg(""), 5000);
        }
    }

    const removeMaterial = (param) => {
        let values = parameters;
        let updateValue = [];
        values[activeMaterial].map(item => {
            if(item !== param){
                updateValue.push(item);
            }
        })
        values[activeMaterial] = updateValue;
        setParameters(values);
        setS(Math.random(10000));
    }

    useEffect(() => {
        const ref = firebase.database().ref();
        const inventoryRef = ref.child('inventory');

        inventoryRef.on("value", snap => {
            let Data = snap.val();
            setData(Data);
            let params = {};
            let tmp = {};
            let tmpMaterial = [];
            Object.keys(Data).map(key => {
                let t = [];
                Object.keys(Data[key]).map(k => {
                    t.push(k);
                })
                params[key] = t;
                tmpMaterial.push(key);
                tmp[key] = params;
            })
            setMaterial(tmpMaterial);
            setParameters(params);
        })
    }, []);

    if (!isAuthenticated) {
        return <Redirect to='/login' />
    }

    if (role !== "admin" && role !== "power user") {
        return <Redirect to='/notAllowed' />
    }

    disappear();

    return (
        <div style={{ display: 'flex' }}>
            <CssBaseline />
            <NavBar />
            <Fab className={classes.addBtn} color="secondary" aria-label="add" onClick={handleClickOpen}>
                <AddIcon />
            </Fab>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title" style={{ minWidth: 500 }}>Add Material</DialogTitle>
                {
                    msg !== "" ? <Alert severity={type}>{msg}</Alert> : <div></div>
                }
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="normal"
                        variant="outlined"
                        id="name"
                        label="Material"
                        value={name}
                        fullWidth
                        onChange={e => setName(e.target.value)}
                    />
                    {newMaterial && newMaterial.map((field, index) => {
                        return (
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <TextField
                                    margin="normal"
                                    variant="outlined"
                                    label="Parameter"
                                    value={updateParameter[index]}
                                    fullWidth
                                    onChange={e => handleInputChange(index, e)}
                                    style={{ marginRight: 10 }}
                                />
                                <Button onClick={() => handleAddFields()} margin="dense" raised color="primary" variant="outlined" color="secondary" style={{ marginTop: 15, marginBottom: 10, marginRight: 5, fontSize: 20 }}>
                                    +
                                </Button>
                                <Button onClick={() => handleRemoveFields(index)} color="primary" variant="outlined" color="secondary" style={{ marginTop: 15, marginBottom: 10, fontSize: 25 }}>
                                    -
                                </Button>
                            </div>
                        )
                    })}

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary">Cancel</Button>
                    <Button onClick={saveParameters} color="secondary">Save</Button>
                </DialogActions>
            </Dialog>

            {/* to update existing parameters */}
            <Dialog open={updateOpen} onClose={handleUpdateOpen} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title" style={{ minWidth: 500 }}>{activeMaterial}</DialogTitle>
                {
                    msg !== "" ? <Alert severity={type}>{msg}</Alert> : <div></div>
                }
                <DialogContent>
                    {activeMaterial !== "" && parameters[activeMaterial] !== undefined && parameters[activeMaterial].map((item, index) => {
                        if(item !== ""){
                            return (
                                <div style={{display: 'flex'}}>
                                    <MenuItem style={{float: 'left'}} value={item}>{item}</MenuItem>
                                    <Button type="submit" onClick={() => removeMaterial(item)} style={{float: 'left'}} color="secondary">Remove</Button>
                                </div>
                            )
                        }
                    })}
                    {umaterial && umaterial.map((item, index) => {
                        return (
                            <div style={{ display: 'flex', flexDirection: 'row' }}>
                                <TextField
                                    margin="normal"
                                    variant="outlined"
                                    label="Parameter"
                                    fullWidth
                                    onChange={e => handleUpdateInputChange(index, e)}
                                    style={{ marginRight: 10 }}
                                />
                                <Button onClick={() => handleUpdateAddFields()} margin="dense" raised color="primary" variant="outlined" color="secondary" style={{ marginTop: 15, marginBottom: 10, marginRight: 5, fontSize: 20 }}>
                                    +
                                </Button>
                                <Button onClick={() => handleUpdateRemoveField(index)} color="primary" variant="outlined" color="secondary" style={{ marginTop: 15, marginBottom: 10, fontSize: 25 }}>
                                    -
                                </Button>
                            </div>
                        )
                    })}

                </DialogContent>
                <DialogActions>
                    <Button onClick={handleUpdateClose} color="primary">Cancel</Button>
                    <Button onClick={saveUpdateMaterial} color="secondary">Save</Button>
                </DialogActions>
            </Dialog>

            <div className={classes.inputDiv}>
                <Container component="main" maxWidth="xs">
                    <div className={classes.paper}>
                        <img src={characterSix} class={classes.imgStyle} />
                        <Typography component="h1" variant="h5" style={{ marginTop: 10 }}>
                            Inventory
                        </Typography>
                        {
                            msg !== "" ? <Alert severity={type}>{msg}</Alert> : <div></div>
                        }
                        <form className={classes.form} style={{ marginTop: 25 }}>
                            <FormControl variant="outlined" margin="normal" fullWidth>
                                <InputLabel id="demo-simple-select-outlined-label" margin="normal">Select Material</InputLabel>
                                <Select
                                    labelId="demo-simple-select-label"
                                    id="demo-simple-select-outlined"
                                    value={activeMaterial}
                                    label="Select Material"
                                    fullWidth
                                    onChange={e => setActiveMaterial(e.target.value)}
                                >
                                    {material && material.map(item => {
                                        return (
                                            <MenuItem value={item}>{item}</MenuItem>
                                        )
                                    })}
                                </Select>
                            </FormControl>
                            {activeMaterial !== "" && parameters[activeMaterial] &&
                                parameters[activeMaterial].map(item => {
                                    return (
                                        <TextField
                                            variant="outlined"
                                            margin="normal"
                                            required
                                            fullWidth
                                            label={item}
                                            autoFocus
                                            value={data[activeMaterial][item]}
                                            onChange={(e) => updateParameter(e, item)}
                                        />
                                    )
                                })
                            }
                            {activeMaterial !== "" &&
                                <Button
                                    type="submit"
                                    fullWidth
                                    color="secondary"
                                    variant="contained"
                                    className={classes.submit}
                                    onClick={e => saveDetails(e)}
                                >Submit</Button>}
                            {activeMaterial !== "" &&
                                <Grid container style={{ marginTop: 10 }}>
                                    <Grid item>
                                        <Link onClick={handleUpdateOpen} variant="body2" color="secondary">
                                            {"Update?"}
                                        </Link>
                                    </Grid>
                                </Grid>
                            }
                        </form>
                    </div>
                </Container>
            </div>
        </div>
    )
}

const mapState = state => ({
    isAuthenticated: state.loginReducer.isAuthenticated,
    role: state.loginReducer.role,
})

export default connect(mapState)(Inventory);