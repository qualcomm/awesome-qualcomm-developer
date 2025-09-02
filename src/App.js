// Copyright (c) Qualcomm Technologies, Inc. and/or its subsidiaries.
// SPDX-License-Identifier: BSD-3-Clause

import React, { useState, useEffect } from 'react';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Button from 'react-bootstrap/Button';

import ProjectCarousel from './components/ProjectCarousel';
import ProjectList from './components/ProjectList';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)

const projectFiles = [
    process.env.PUBLIC_URL + '/data/repos-cloud.json',
    process.env.PUBLIC_URL + '/data/repos-compute.json',
    process.env.PUBLIC_URL + '/data/repos-iot.json',
];

function App() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);

    const allPlatforms = [...new Set(projects.flatMap(p => p.platforms))].sort();
    const allCategories = [...new Set(projects.flatMap(p => p.categories))].sort();

    useEffect(() => {
        const fetchProjects = async () => {
            try {
                const allProjects = [];
                for (const file of projectFiles) {
                    const response = await fetch(file);
                    const data = await response.json();
                    allProjects.push(...data);
                }
                setProjects(allProjects);
            } catch (error) {
                console.error("Error fetching projects:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchProjects();
    }, []);

    if (loading) {
        return (
            <div className="container text-center my-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="App">
                {/* <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
                    <div className="container">
                        <a className="navbar-brand" href="/">Awesome Qualcomm Developer Projects</a>
                    </div>
                </nav> */}
                <Navbar expand="lg" bg="primary" variant="dark">
                    <Container>
                        <Navbar.Brand href="index.html">
                            <img alt="Awesome Qualcomm Developer Projects" src="logo.svg" width="30" height="30" className="d-inline-block align-top" />{' '}
                            Awesome Qualcomm Developer Projects
                        </Navbar.Brand>
                        <Navbar.Toggle aria-controls="navbar-nav" />
                        <Navbar.Collapse id="navbar-nav">
                            <Nav className="me-auto">
                                <NavDropdown
                                    title={
                                        <>
                                            <span className="text-white">
                                                <FontAwesomeIcon icon="fa-solid fa-microchip" className="me-2" />
                                                Platforms
                                            </span>
                                        </>
                                    }
                                    id="platform-dropdown" className="text-white"
                                >
                                    {allPlatforms.map(platform => (
                                        <NavDropdown.Item key={platform} href={`/?platform=${encodeURIComponent(platform)}`}>
                                            {platform}
                                        </NavDropdown.Item>
                                    ))}
                                </NavDropdown>
                                <NavDropdown
                                    title={
                                        <>
                                            <span className="text-white">
                                                <FontAwesomeIcon icon="fa-solid fa-list-check" className="me-2" />
                                                Categories
                                            </span>
                                        </>
                                    }
                                    id="category-dropdown"
                                >
                                    {allCategories.map(category => (
                                        <NavDropdown.Item key={category} href={`/?category=${encodeURIComponent(category)}`}>
                                            {category}
                                        </NavDropdown.Item>
                                    ))}
                                </NavDropdown>
                            </Nav>
                            <Navbar.Text>
                                <Button variant="info" href="https://github.com/qualcomm/awesome-qualcomm-developer/blob/main/CONTRIBUTING.md" target="_blank">
                                    Add your awesome project!
                                </Button>
                            </Navbar.Text>
                        </Navbar.Collapse>
                    </Container>
                </Navbar>
                <Container className="mt-4">
                    <h4 className="mb-4">Featured Projects</h4>
                    <ProjectCarousel projects={projects} />
                    <h4 className="mb-4">All Projects</h4>
                    <ProjectList projects={projects} />
                    <footer className="text-center mt-4 mb-4 border-top">
                        <p class="mt-3 mb-3">
                            Brought to you by <a href="https://qualcomm.com/developer" target="_blank" rel="noreferrer">Qualcomm</a>
                        </p>
                        <small>
                            <b>Disclaimer</b>: This site is a community-curated listing of third-party projects.
                            Qualcomm does not own or maintain these projects and is not responsible for their content.
                            <a href="https://github.com/qualcomm/awesome-qualcomm-developer#-disclaimer" target="_blank" rel="noreferrer">Learn more.</a>
                        </small>
                    </footer>
                </Container>
            </div>
        </>
    );
}

export default App;
