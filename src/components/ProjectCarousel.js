// Copyright (c) Qualcomm Technologies, Inc. and/or its subsidiaries.
// SPDX-License-Identifier: BSD-3-Clause

import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Carousel from 'react-bootstrap/Carousel';
import Card from 'react-bootstrap/Card';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'
import { fab } from '@fortawesome/free-brands-svg-icons'

library.add(fas, fab)



const ProjectCarousel = ({ projects }) => {
    const showcaseProjects = projects.filter(p => p.isShowcase);

    const quickLinks = [
        { name: 'Qualcomm on GitHub', url: 'https://github.com/Qualcomm', icon: 'fa-brands fa-github' },
        { name: 'Qualcomm Developers', url: 'https://www.qualcomm.com/developer', icon: 'fa-solid fa-laptop-code' },
        { name: 'Qualcomm AI Hub', url: 'https://aihub.qualcomm.com/', icon: 'fa-solid fa-atom' },
        { name: 'Developer Discord', url: 'https://discord.com/invite/qualcommdevelopernetwork', icon: 'fa-brands fa-discord' },
        { name: 'Developer YouTube', url: 'https://www.youtube.com/qualcommdev', icon: 'fa-brands fa-youtube' },
    ]

    if (showcaseProjects.length === 0) {
        return null;
    }

    return (
        <>
            <Row className="mb-4">
                <Col md={8}>
                    <Carousel variant="dark" controls={false} indicators={false}>
                        {showcaseProjects.map((project, index) => (
                            <Carousel.Item key={project.name}>
                                <Card className="shadow-sm pb-4">
                                    <Card.Body>
                                        <Card.Title className="mb-2">
                                            <Card.Link href={project.link} target="_blank" rel="noopener noreferrer" className="fw-bold text-decoration-none small">
                                                {project.name}<FontAwesomeIcon icon="fa-solid fa-arrow-up-right-from-square" className="ms-2" />
                                            </Card.Link>
                                        </Card.Title>
                                        <Card.Subtitle className="mb-2 text-muted small">
                                            By:&nbsp;
                                            <Card.Link href={`https://github.com/${project.author}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none">
                                                {project.author}
                                            </Card.Link>
                                        </Card.Subtitle>
                                        <Card.Text className="small">{project.description}</Card.Text>
                                        <Card.Text>
                                            <a href={project.link} target="_blank" rel="noopener noreferrer" className="card-link">
                                                View Project
                                            </a>
                                        </Card.Text>
                                    </Card.Body>
                                </Card >
                            </Carousel.Item >
                        ))}
                    </Carousel >
                </Col >
                <Col className="pt-2" style={{ backgroundColor: '#f9f9f9' }} >
                    <h5>Qualcomm Quick Links</h5>
                    <ul className="list-unstyled">
                        {quickLinks.map(link => (
                            <li key={link.name}>
                                <a href={link.url} target="_blank" rel="noopener noreferrer" className=" text-decoration-none">
                                    <FontAwesomeIcon icon={link.icon} className="ms-2" /> {link.name}
                                </a>
                            </li>
                        ))}
                    </ul>
                </Col>
            </Row >
        </>
    );
};

export default ProjectCarousel;