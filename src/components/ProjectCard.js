// Copyright (c) Qualcomm Technologies, Inc. and/or its subsidiaries.
// SPDX-License-Identifier: BSD-3-Clause

import React from 'react';
import Card from 'react-bootstrap/Card';
import Col from 'react-bootstrap/Col';
import Badge from 'react-bootstrap/Badge';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { library } from '@fortawesome/fontawesome-svg-core'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas)

const ProjectCard = ({ project }) => {
    const { name, author, stars, language, link, lastUpdated, platforms, categories, description } = project;

    return (
        <Col md={6} lg={4} className="mb-4">
            <Card className="h-100 shadow-sm">
                <Card.Header>
                    <Card.Link href={link} target="_blank" rel="noopener noreferrer" className="fw-bold text-decoration-none">
                        {name}<FontAwesomeIcon icon="fa-solid fa-arrow-up-right-from-square" className="ms-2" />
                    </Card.Link>
                </Card.Header>
                <Card.Body className="d-flex flex-column">
                    <Card.Text>{description}</Card.Text>
                    <Card.Subtitle className="mt-auto mb-2 text-muted small">
                        By: <Card.Link href={`https://github.com/${author}`} target="_blank" rel="noopener noreferrer" className="text-decoration-none">{author}</Card.Link>
                    </Card.Subtitle>
                    <Card.Text className="text-muted small">
                        <FontAwesomeIcon icon="fa-solid fa-code" /> {language}
                        <span className="ms-2"><FontAwesomeIcon icon="fa-solid fa-star" /> {stars}</span>
                    </Card.Text>
                    <Card.Text>
                        {platforms.map(platform => (
                            <Badge key={platform} bg="primary" className="rounded-pill me-1">{platform}</Badge>
                        ))}
                    </Card.Text>
                    <Card.Text>
                        {categories.map(category => (
                            <Badge key={category} bg="info" className="rounded-pill me-1">{category}</Badge>
                        ))}
                    </Card.Text>
                </Card.Body>
                <Card.Footer className="text-muted small">
                    Updated: {new Date(lastUpdated).toLocaleDateString()}
                </Card.Footer>
            </Card>
        </Col>
    );
};

export default ProjectCard;